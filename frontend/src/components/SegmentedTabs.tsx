import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Item = { key: string; label: string };

export default function SegmentedTabs({
  items,
  value,
  onChange,
}: {
  items: Item[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            style={styles.tab}
            onPress={() => onChange(item.key)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            <View style={[styles.underline, active && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 12,
  },
  label: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  labelActive: {
    color: "#f8fafc",
  },
  underline: {
    height: 2,
    width: "56%",
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  underlineActive: {
    backgroundColor: "#38bdf8",
  },
});
