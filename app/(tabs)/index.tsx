import HomeScreen from "@/components/home";
import {StyleSheet, View} from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <HomeScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
