import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  /** Icon-only header action (e.g. logout) */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRight?: () => void;
  loading?: boolean;
  error?: string | null;
};

export default function Screen({
  title,
  children,
  onBack,
  rightIcon,
  onRight,
  loading,
  error,
}: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.sideBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#38bdf8" />
          </Pressable>
        ) : (
          <View style={styles.sideBtn} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {rightIcon && onRight ? (
          <Pressable onPress={onRight} style={styles.sideBtn} hitSlop={8}>
            <Ionicons name={rightIcon} size={22} color="#38bdf8" />
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
    paddingVertical: 12,
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
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  error: { color: "#fca5a5", textAlign: "center", fontSize: 15 },
});
