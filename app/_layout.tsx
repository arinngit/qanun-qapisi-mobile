import { Stack } from 'expo-router';
import { AuthProvider } from '../context/auth-context';
import { LanguageProvider } from '../context/language-context';
import { ThemeProvider } from '../context/theme-context';
import Toast from 'react-native-toast-message';
import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    const enableScreenProtection = async () => {
      try {
        // Prevent screenshots and screen recording
        await ScreenCapture.preventScreenCaptureAsync();
        console.log('Screen capture protection enabled');
      } catch (error) {
        console.warn('Failed to enable screen capture protection:', error);
      }
    };

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      enableScreenProtection();
    }

    return () => {
      // Re-enable screen capture when app unmounts (cleanup)
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    };
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="test" />
          </Stack>
          <Toast />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
