import TestScreen from "@/components/tests";
import {StyleSheet, View} from "react-native";

export default function Tests() {
  return (
    <View style={styles.container}>
      <TestScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
