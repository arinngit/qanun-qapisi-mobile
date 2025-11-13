import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/auth-context";
import { fadeTransitionConfig } from "../../utils/navigation-transitions";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...fadeTransitionConfig,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
          ...fadeTransitionConfig,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: "Sign Up",
          headerShown: false,
          ...fadeTransitionConfig,
        }}
      />
      <Stack.Screen
        name="verify-code"
        options={{
          title: "Verify",
          headerShown: false,
          ...fadeTransitionConfig,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: "Reset Password",
          headerShown: false,
          ...fadeTransitionConfig,
        }}
      />
    </Stack>
  );
}
