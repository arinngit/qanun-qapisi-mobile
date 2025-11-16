import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import * as ScreenCapture from "expo-screen-capture";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import AppStatusBar from "../components/theme/app-status-bar";
import { AuthProvider, useAuth } from "../context/auth-context";
import { LanguageProvider } from "../context/language-context";
import { ThemeProvider } from "../context/theme-context";
import { fadeTransitionConfig } from "../utils/navigation-transitions";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

function AppContent() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [hasHiddenSplash, setHasHiddenSplash] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const hasNavigatedRef = useRef(false);

  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasOnBoarded = await AsyncStorage.getItem("hasOnBoarded");
        setHasOnboarded(hasOnBoarded === "true");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setHasOnboarded(false); // Default to false on error to show onboarding
      } finally {
        setHasCheckedOnboarding(true);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!hasCheckedOnboarding || hasOnboarded) {
      return;
    }

    const syncOnboardingStatus = async () => {
      try {
        const storedValue = await AsyncStorage.getItem("hasOnBoarded");
        if (storedValue === "true") {
          setHasOnboarded(true);
        }
      } catch (error) {
        console.error("Error syncing onboarding status:", error);
      }
    };

    syncOnboardingStatus();
  }, [segments, hasCheckedOnboarding, hasOnboarded]);

  // Hide splash screen when ready
  useEffect(() => {
    const hideSplash = async () => {
      if (!authLoading && hasCheckedOnboarding && hasOnboarded !== null) {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn("Failed to hide splash screen:", error);
        } finally {
          setHasHiddenSplash(true);
        }
      }
    };

    hideSplash();
  }, [authLoading, hasCheckedOnboarding, hasOnboarded]);

  // Reset navigation ref when onboarding or auth status changes
  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [hasOnboarded, isAuthenticated]);

  // Navigate based on onboarding and auth status
  useEffect(() => {
    if (
      authLoading ||
      !hasCheckedOnboarding ||
      hasOnboarded === null ||
      !hasHiddenSplash ||
      hasNavigatedRef.current
    ) {
      return;
    }

    const currentRoute = segments[0] || "";

    if (hasOnboarded) {
      // If onboarded, redirect based on auth status
      if (!isAuthenticated) {
        // If onboarded but not authenticated, redirect to auth
        if (currentRoute !== "(auth)") {
          hasNavigatedRef.current = true;
          router.replace("/(auth)/login");
        }
      } else {
        // If onboarded and authenticated, redirect to tabs
        if (currentRoute !== "(tabs)") {
          hasNavigatedRef.current = true;
          router.replace("/(tabs)");
        }
      }
    } else {
      // If not onboarded, show onboarding (index screen)
      if (currentRoute && currentRoute !== "index") {
        hasNavigatedRef.current = true;
        router.replace("/");
      }
    }
  }, [
    authLoading,
    hasCheckedOnboarding,
    hasOnboarded,
    hasHiddenSplash,
    isAuthenticated,
    segments,
    router,
  ]);

  // Show nothing while loading
  if (
    authLoading ||
    !hasCheckedOnboarding ||
    hasOnboarded === null ||
    !hasHiddenSplash
  ) {
    return null;
  }

  // Render Stack - navigation is handled by useEffect
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStatusBar />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#F9FAFB",
          },
          ...fadeTransitionConfig,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            ...fadeTransitionConfig,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            ...fadeTransitionConfig,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            ...fadeTransitionConfig,
          }}
        />
        {/* 
          Note: test/, admin/, bookmarks.tsx, search.tsx, statistics.tsx
          are automatically registered by Expo Router based on file structure.
        */}
      </Stack>
      <Toast />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const enableScreenProtection = async () => {
      try {
        if (Platform.OS === "android" || Platform.OS === "ios") {
          await ScreenCapture.preventScreenCaptureAsync();
          console.log("Screen capture protection enabled");
        }
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
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
