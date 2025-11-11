import { Stack } from "expo-router";
import * as ScreenCapture from "expo-screen-capture";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import AppStatusBar from "../components/theme/app-status-bar";
import { AuthProvider } from "../context/auth-context";
import { LanguageProvider } from "../context/language-context";
import { ThemeProvider } from "../context/theme-context";

export default function RootLayout() {
  useEffect(() => {
    const enableScreenProtection = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
        console.log("Screen capture protection enabled");
      } catch (error) {
        console.warn("Failed to enable screen capture protection:", error);
      }
    };

    if (Platform.OS === "android" || Platform.OS === "ios") {
      enableScreenProtection();
    }

    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppStatusBar />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="test" />
            </Stack>
            <Toast />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
