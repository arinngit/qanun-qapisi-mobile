import SignUpScreen from "@/components/auth/sign-up";
import {StyleSheet, View} from "react-native";

export default function SignUp() {
  return (
    <View style={styles.container}>
      <SignUpScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
