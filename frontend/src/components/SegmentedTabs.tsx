import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme";

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
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radii.md,
        },
      ]}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            style={[
              styles.tab,
              active && {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.shadow.color,
                shadowOffset: theme.shadow.offset,
                shadowOpacity: theme.shadow.opacity,
                shadowRadius: 6,
                elevation: 2,
              },
            ]}
            onPress={() => onChange(item.key)}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? theme.colors.primary : theme.colors.textMuted,
                  fontFamily: active
                    ? theme.fonts.bodyBold
                    : theme.fonts.body,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
  },
});
