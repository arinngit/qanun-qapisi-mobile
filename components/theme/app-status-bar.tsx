import { useTheme } from "@/context/theme-context";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";

const AppStatusBar: React.FC = () => {
  const { isDark, colors } = useTheme();

  const style = isDark ? "light" : "dark";
  const backgroundColor = colors.background;

  return (
    <StatusBar
      style={style}
      backgroundColor={Platform.OS === "android" ? backgroundColor : undefined}
      translucent={false}
      animated
    />
  );
};

export default AppStatusBar;
