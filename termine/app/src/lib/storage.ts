import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Credential storage.
 *
 * The install id is the account: whoever holds it holds the watches. It goes
 * in the Keychain / Android Keystore, never in AsyncStorage. SecureStore has
 * no web implementation, so the web build falls back to localStorage — good
 * enough for a browser tab, and the reason the web target is treated as a
 * convenience rather than the primary client.
 */

const INSTALL_ID_KEY = 'terminradar.install_id';
const TOKEN_KEY = 'terminradar.token';

const webStore = {
  getItem(key: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem(key: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  },
};

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return webStore.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStore.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    webStore.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

/** A 128-bit random id, hex encoded. */
function generateInstallId(): string {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getOrCreateInstallId(): Promise<string> {
  const existing = await getItem(INSTALL_ID_KEY);
  if (existing) return existing;
  const created = generateInstallId();
  await setItem(INSTALL_ID_KEY, created);
  return created;
}

export const tokenStore = {
  get: () => getItem(TOKEN_KEY),
  set: (token: string) => setItem(TOKEN_KEY, token),
  clear: () => removeItem(TOKEN_KEY),
};

/** Wipes the account. Used by "Alle Daten löschen" in settings. */
export async function resetIdentity(): Promise<void> {
  await removeItem(TOKEN_KEY);
  await removeItem(INSTALL_ID_KEY);
}
