import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import type { SchoolRow } from "../types";

const schoolArt = require("../../assets/illustrations/school-badge.png");

export default function SchoolCard({
  school,
  accent,
  onPress,
}: {
  school: SchoolRow;
  accent: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          shadowColor: theme.shadow.color,
          shadowOffset: theme.shadow.offset,
          shadowOpacity: theme.shadow.opacity,
          shadowRadius: theme.shadow.radius,
          elevation: 2,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.artWrap, { backgroundColor: `${accent}22` }]}>
          <Image source={schoolArt} style={styles.art} resizeMode="contain" />
        </View>
        <View style={styles.titleBlock}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontFamily: theme.fonts.display,
              },
            ]}
            numberOfLines={2}
          >
            {school.name}
          </Text>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: school.isActive
                  ? theme.colors.primarySoft
                  : theme.colors.dangerSoft,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: school.isActive
                    ? theme.colors.primary
                    : theme.colors.danger,
                  fontFamily: theme.fonts.bodyBold,
                },
              ]}
            >
              {school.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={accent} />
      </View>

      <View style={[styles.stats, { borderTopColor: theme.colors.border }]}>
        <Stat
          label="Admin code"
          value={school.activationCode || "—"}
          theme={theme}
        />
        <Stat
          label="Teachers"
          value={String(school.stats.teacherCount)}
          theme={theme}
        />
        <Stat
          label="Students"
          value={String(school.stats.studentCount)}
          theme={theme}
        />
        <Stat
          label="Logins"
          value={String(school.stats.distinctLoginUsers)}
          theme={theme}
        />
      </View>
    </Pressable>
  );
}

function Stat({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.stat}>
      <Text
        style={[
          styles.statLabel,
          {
            color: theme.colors.textMuted,
            fontFamily: theme.fonts.body,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.statValue,
          {
            color: theme.colors.text,
            fontFamily: theme.fonts.bodyBold,
          },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderWidth: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  artWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  art: { width: 50, height: 50 },
  titleBlock: { flex: 1, gap: 6 },
  title: { fontSize: 18, lineHeight: 22 },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12 },
  stats: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stat: {
    width: "47%",
    minWidth: "45%",
  },
  statLabel: { fontSize: 11, marginBottom: 2 },
  statValue: { fontSize: 14 },
});
