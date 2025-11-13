import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../context/auth-context";
import { fadeTransitionConfig } from "../../utils/navigation-transitions";

export default function AdminLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/(tabs)");
    }
  }, [user]);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#7313e8",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
        ...fadeTransitionConfig,
      }}
    >
      <Stack.Screen
        name="tests/index"
        options={{
          title: "Test İdarəetməsi",
          ...fadeTransitionConfig,
        }}
      />
      <Stack.Screen
        name="tests/create"
        options={{
          title: "Yeni Test Yarat",
          ...fadeTransitionConfig,
        }}
      />
      <Stack.Screen
        name="tests/edit/[id]"
        options={{
          title: "Testi Redaktə Et",
          ...fadeTransitionConfig,
        }}
      />
      <Stack.Screen
        name="users/index"
        options={{
          title: "İstifadəçi İdarəetməsi",
          ...fadeTransitionConfig,
        }}
      />
    </Stack>
  );
}
