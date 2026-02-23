import AsyncStorage from "@react-native-async-storage/async-storage";
import {Stack, useRouter, useSegments} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {useEffect, useRef, useState} from "react";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import AppStatusBar from "../components/theme/app-status-bar";
import {AuthProvider, useAuth} from "@/context/auth-context";
import {LanguageProvider} from "@/context/language-context";
import {ThemeProvider} from "@/context/theme-context";
import {fadeTransitionConfig} from "@/utils/navigation-transitions";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

function AppContent() {
  const {loading: authLoading, isAuthenticated} = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [hasHiddenSplash, setHasHiddenSplash] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const hasNavigatedRef = useRef(false);

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

  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [hasOnboarded, isAuthenticated]);

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
      if (!isAuthenticated) {
        if (currentRoute !== "(auth)") {
          hasNavigatedRef.current = true;
          router.replace("/(auth)/login");
        }
      } else {
        if (currentRoute !== "(tabs)") {
          hasNavigatedRef.current = true;
          router.replace("/(tabs)");
        }
      }
    } else {
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

  if (
    authLoading ||
    !hasCheckedOnboarding ||
    hasOnboarded === null ||
    !hasHiddenSplash
  ) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AppStatusBar/>
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
      </Stack>
      <Toast/>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent/>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
