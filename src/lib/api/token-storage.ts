import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const accessKey = 'followly.access-token';
const refreshKey = 'followly.refresh-token';

const memory = new Map<string, string>();

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await setSecret(accessKey, accessToken);
  await setSecret(refreshKey, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return readSecret(accessKey);
}

export async function getRefreshToken(): Promise<string | null> {
  return readSecret(refreshKey);
}

export async function clearTokens(): Promise<void> {
  await deleteSecret(accessKey);
  await deleteSecret(refreshKey);
}

async function setSecret(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    memory.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function readSecret(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return memory.get(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecret(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    memory.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
