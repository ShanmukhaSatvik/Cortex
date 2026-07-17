import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "../theme";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.outer,
        { backgroundColor: theme.colors.bgBottom },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    maxWidth: Platform.OS === "web" ? 430 : undefined,
  },
});
