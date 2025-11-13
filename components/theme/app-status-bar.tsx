import { useTheme } from "@/context/theme-context";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";

const AppStatusBar: React.FC = () => {
  const { isDark, colors } = useTheme();

  const style = isDark ? "light" : "dark";
  const backgroundColor = colors.background;

  return (
    <StatusBar
      style={style}
      backgroundColor={Platform.OS === "android" ? backgroundColor : undefined}
      translucent={Platform.OS === "android"}
      animated
    />
  );
};

export default AppStatusBar;

// Status bar height utility for Android
export const getStatusBarHeight = (): number => {
  if (Platform.OS === "android") {
    return RNStatusBar.currentHeight || 0;
  }
  return 0;
};
