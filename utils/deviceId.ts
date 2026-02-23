import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const DEVICE_ID_KEY = 'deviceId';

export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      const deviceInfo = [
        Device.modelId || Device.modelName || 'unknown-model',
        Device.osName || 'unknown-os',
        Device.osVersion || 'unknown-version',
        Constants.sessionId || 'unknown-session',
        Date.now().toString(),
        Math.random().toString(36).substring(2, 15)
      ].join('-');

      deviceId = `device-${deviceInfo}`;

      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch {
    const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    try {
      await AsyncStorage.setItem(DEVICE_ID_KEY, fallbackId);
    } catch {
      // Storage completely unavailable
    }
    return fallbackId;
  }
};

export const clearDeviceId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
  } catch {
    // Storage unavailable
  }
};
