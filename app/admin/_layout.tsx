import { Stack } from "expo-router";
import { useAuth } from "../../context/auth-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function AdminLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/(tabs)/index");
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
      }}
    >
      <Stack.Screen
        name="tests/index"
        options={{
          title: "Test İdarəetməsi",
        }}
      />
      <Stack.Screen
        name="tests/create"
        options={{
          title: "Yeni Test Yarat",
        }}
      />
      <Stack.Screen
        name="tests/edit/[id]"
        options={{
          title: "Testi Redaktə Et",
        }}
      />
      <Stack.Screen
        name="users/index"
        options={{
          title: "İstifadəçi İdarəetməsi",
        }}
      />
    </Stack>
  );
}

