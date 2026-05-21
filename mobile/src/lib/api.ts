import { supabase } from './supabase';
import * as SecureStore from 'expo-secure-store';

const COMPANY_KEY = 'active_company_id';

const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export type ApiError = {
  status: number;
  message: string;
  detail?: unknown;
};

export class HttpError extends Error implements ApiError {
  public readonly status: number;
  public readonly detail?: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export async function getActiveCompanyId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(COMPANY_KEY);
  } catch {
    return null;
  }
}

export async function setActiveCompanyId(id: string | null): Promise<void> {
  try {
    if (id) {
      await SecureStore.setItemAsync(COMPANY_KEY, id);
    } else {
      await SecureStore.deleteItemAsync(COMPANY_KEY);
    }
  } catch {
    // ignore
  }
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  companyId?: string | null;
  skipAuth?: boolean;
};

function buildQuery(query?: RequestOptions['query']): string {
  if (!query) return '';
  const entries = Object.entries(query).filter(([, value]) => value !== undefined && value !== '');
  if (entries.length === 0) return '';
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    params.append(key, String(value));
  }
  return `?${params.toString()}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}${buildQuery(options.query)}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };

  if (!options.skipAuth) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const companyId = options.companyId ?? (await getActiveCompanyId());
  if (companyId) {
    headers['X-Company-Id'] = companyId;
  }

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      body = options.body;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body,
    signal: options.signal,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload: unknown = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    if (payload && typeof payload === 'object' && 'detail' in payload) {
      const detail = (payload as { detail: unknown }).detail;
      if (typeof detail === 'string') message = detail;
    } else if (typeof payload === 'string' && payload.length > 0) {
      message = payload;
    }
    throw new HttpError(response.status, message, payload);
  }

  return payload as T;
}
