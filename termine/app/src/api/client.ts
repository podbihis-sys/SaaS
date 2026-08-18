import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getOrCreateInstallId, tokenStore } from '@/lib/storage';

import type { ApiErrorBody, AuthResponse } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details ?? {};
  }
}

function resolveBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');

  // In Expo Go the packager host is the developer's machine, which is also
  // where the API runs. Android emulators cannot reach `localhost`, so the
  // packager address is the only value that works on every device.
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:8000`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
}

export const API_BASE_URL = resolveBaseUrl();

/**
 * Token acquisition is deduplicated: several queries mount at once on a cold
 * start, and without this each would create its own account.
 */
let authInFlight: Promise<string> | null = null;

async function authenticate(): Promise<string> {
  const installId = await getOrCreateInstallId();
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ install_id: installId, locale: 'de' }),
  });
  if (!response.ok) {
    throw new ApiError(response.status, await safeErrorBody(response));
  }
  const data = (await response.json()) as AuthResponse;
  await tokenStore.set(data.token);
  return data.token;
}

async function getToken(): Promise<string> {
  const stored = await tokenStore.get();
  if (stored) return stored;
  if (!authInFlight) {
    authInFlight = authenticate().finally(() => {
      authInFlight = null;
    });
  }
  return authInFlight;
}

async function safeErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return { code: 'http_error', message: `HTTP ${response.status}` };
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | string[] | undefined | null>;
  /** Endpoints that work without a token, e.g. the office catalogue. */
  anonymous?: boolean;
}

function buildUrl(path: string, query: RequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) {
        // FastAPI reads repeated keys as a list.
        value.forEach((entry) => url.searchParams.append(key, entry));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, anonymous = false } = options;

  const send = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let token = anonymous ? null : await getToken();
  let response = await send(token);

  // A stored token can outlive the server's signing key, or the account can be
  // removed. One silent re-auth beats showing the user a login screen they
  // never signed up for.
  if (response.status === 401 && !anonymous) {
    await tokenStore.clear();
    token = await getToken();
    response = await send(token);
  }

  if (!response.ok) {
    throw new ApiError(response.status, await safeErrorBody(response));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Forces token creation, e.g. before registering a push token at startup. */
export async function ensureAuthenticated(): Promise<void> {
  await getToken();
}
