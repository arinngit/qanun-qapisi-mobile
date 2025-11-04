import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const DEVICE_ID_KEY = 'deviceId';

/**
 * Get a unique and persistent device identifier
 * This ID will be used for device restriction (one account per device)
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    // Try to get existing device ID from storage
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate a new unique device ID
      // Using a combination of device info to create a unique identifier
      const deviceInfo = [
        Device.modelId || Device.modelName || 'unknown-model',
        Device.osName || 'unknown-os',
        Device.osVersion || 'unknown-version',
        Constants.sessionId || 'unknown-session',
        Date.now().toString(),
        Math.random().toString(36).substring(2, 15)
      ].join('-');
      
      deviceId = `device-${deviceInfo}`;
      
      // Store it for future use
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback to a random ID if there's an error
    const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    return fallbackId;
  }
};

/**
 * Clear the stored device ID (useful for debugging or reset)
 */
export const clearDeviceId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Error clearing device ID:', error);
  }
};

