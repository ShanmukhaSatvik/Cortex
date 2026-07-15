import React from "react";
import { Platform, StyleSheet, View } from "react-native";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return <View style={styles.outer}>{children}</View>;
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    maxWidth: Platform.OS === "web" ? 430 : undefined,
    backgroundColor: "#0f172a",
  },
});
