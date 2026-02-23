import ResetPasswordScreen from "@/components/auth/reset-password";
import {StyleSheet, View} from "react-native";

export default function ResetPassword() {
  return (
    <View style={styles.container}>
      <ResetPasswordScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
