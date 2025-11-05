import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/auth-context";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: "Sign Up",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="verify-code"
        options={{
          title: "Verify",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: "Reset Password",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
