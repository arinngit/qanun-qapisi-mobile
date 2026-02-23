import VerifyScreen from "@/components/auth/verify-code";
import {StyleSheet, View} from "react-native";

export default function Verify() {
  return (
    <View style={styles.container}>
      <VerifyScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
