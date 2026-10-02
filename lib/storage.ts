import { Platform } from 'react-native';

const STORAGE_KEY = 'agent_device_id';
const SELECTED_DEVICE_KEY = 'selected_device_id';

// NOTE: `AsyncStorage` was removed from the core `react-native` package years ago
// (it now lives in the separate `@react-native-async-storage/async-storage` package,
// which this project does not currently depend on). `require('react-native').AsyncStorage`
// is always `undefined` on native, so the previous implementation silently failed every
// time it was called. This in-memory fallback at least keeps values stable for the
// lifetime of the app (pairing won't have to be redone every screen), even though it
// won't survive a full app restart yet. A proper fix is to add
// `@react-native-async-storage/async-storage` as a dependency.
const memoryStore = new Map<string, string>();

export async function getDeviceId(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(STORAGE_KEY);
  }
  return memoryStore.get(STORAGE_KEY) ?? null;
}

export async function setDeviceId(id: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, id);
    return;
  }
  memoryStore.set(STORAGE_KEY, id);
}

export async function clearDeviceId(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  memoryStore.delete(STORAGE_KEY);
}

export async function getSelectedDeviceId(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(SELECTED_DEVICE_KEY);
  }
  return memoryStore.get(SELECTED_DEVICE_KEY) ?? null;
}

export async function setSelectedDeviceId(id: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(SELECTED_DEVICE_KEY, id);
    return;
  }
  memoryStore.set(SELECTED_DEVICE_KEY, id);
}
