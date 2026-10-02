import { Platform } from 'react-native';

const STORAGE_KEY = 'agent_device_id';
const SELECTED_DEVICE_KEY = 'selected_device_id';

export async function getDeviceId(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(STORAGE_KEY);
  }
    try {
      const AsyncStorage = require('react-native').AsyncStorage;
      return await AsyncStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

export async function setDeviceId(id: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, id);
  }
    try {
      const AsyncStorage = require('react-native').AsyncStorage;
      await AsyncStorage.setItem(STORAGE_KEY, id);
    } catch {
      // noop
    }
  }

export async function clearDeviceId(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(STORAGE_KEY);
  }
    try {
      const AsyncStorage = require('react-native').AsyncStorage;
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  }

export async function getSelectedDeviceId(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(SELECTED_DEVICE_KEY);
  }
  try {
      const AsyncStorage = require('react-native').AsyncStorage;
      return await AsyncStorage.getItem(SELECTED_DEVICE_KEY);
    } catch {
      return null;
    }
  }

export async function setSelectedDeviceId(id: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(SELECTED_DEVICE_KEY, id);
  }
    try {
      const AsyncStorage = require('react-native').AsyncStorage;
      await AsyncStorage.setItem(SELECTED_DEVICE_KEY, id);
    } catch {
      // noop
    }
  }
