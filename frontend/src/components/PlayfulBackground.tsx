import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme";

/** Soft sky→cream plane with light decorative blobs (kids atmosphere). */
export default function PlayfulBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.colors.bgTop, theme.colors.bgBottom]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.blob,
          styles.blobA,
          { backgroundColor: theme.colors.sunSoft },
        ]}
      />
      <View
        style={[
          styles.blob,
          styles.blobB,
          { backgroundColor: theme.colors.primarySoft },
        ]}
      />
      <View
        style={[
          styles.blob,
          styles.blobC,
          { backgroundColor: theme.colors.accentSoft },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  content: { flex: 1 },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.55,
  },
  blobA: { width: 180, height: 180, top: -40, right: -50 },
  blobB: { width: 140, height: 140, bottom: 80, left: -60 },
  blobC: { width: 100, height: 100, bottom: -20, right: 40 },
});
