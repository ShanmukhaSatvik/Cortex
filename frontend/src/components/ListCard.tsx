import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ListCard({
  title,
  subtitle,
  onPress,
  right,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: string;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <Text style={styles.right}>{right}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { color: "#f8fafc", fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  right: { color: "#38bdf8", fontWeight: "700" },
});
