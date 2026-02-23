import Login from "@/components/auth/login";
import {StyleSheet, View} from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Login/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
