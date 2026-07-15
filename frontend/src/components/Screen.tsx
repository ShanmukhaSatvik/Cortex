import React from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  rightLabel?: string;
  onRight?: () => void;
  loading?: boolean;
  error?: string | null;
};

export default function Screen({
  title,
  children,
  onBack,
  rightLabel,
  onRight,
  loading,
  error,
}: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.sideBtn}>
            <Text style={styles.sideText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.sideBtn} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {rightLabel && onRight ? (
          <Pressable onPress={onRight} style={styles.sideBtn}>
            <Text style={styles.sideText}>{rightLabel}</Text>
          </Pressable>
        ) : (
          <View style={styles.sideBtn} />
        )}
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#38bdf8" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <View style={styles.body}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
  },
  sideBtn: { minWidth: 64, paddingVertical: 4 },
  sideText: { color: "#38bdf8", fontWeight: "600" },
  body: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  error: { color: "#fca5a5", textAlign: "center", fontSize: 15 },
});
