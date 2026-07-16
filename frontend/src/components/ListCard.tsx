import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ListCard({
  title,
  subtitle,
  onPress,
  showChevron = false,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  onDelete?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.card, onDelete ? styles.cardWithDelete : null]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {showChevron ? (
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        ) : null}
      </Pressable>

      {onDelete ? (
        <Pressable
          style={styles.deleteBtn}
          onPress={onDelete}
          hitSlop={6}
          accessibilityLabel="Delete"
        >
          <Ionicons name="trash-outline" size={16} color="#f87171" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
    position: "relative",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardWithDelete: {
    paddingRight: 36,
  },
  textBlock: { flex: 1, paddingRight: 4 },
  title: { color: "#f8fafc", fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  deleteBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    zIndex: 3,
  },
});

