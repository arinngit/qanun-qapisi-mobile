import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "react-native";

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return <RootLayoutContent />;
}
