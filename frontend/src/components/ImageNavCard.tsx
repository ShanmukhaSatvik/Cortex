import React from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";

/** Shared kids-style row card with illustration (grades / subjects / chapters / topics). */
export default function ImageNavCard({
  title,
  subtitle,
  image,
  accent,
  badge,
  onPress,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  image: ImageSourcePropType;
  accent: string;
  badge?: string | number;
  onPress: () => void;
  onDelete?: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          onDelete ? styles.cardWithDelete : null,
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
        <View style={[styles.artWrap, { backgroundColor: `${accent}22` }]}>
          <Image source={image} style={styles.art} resizeMode="contain" />
          {badge != null ? (
            <View style={[styles.badge, { backgroundColor: accent }]}>
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: theme.colors.textOnAccent,
                    fontFamily: theme.fonts.display,
                  },
                ]}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.textBlock}>
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
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.body,
                },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={20} color={accent} />
      </Pressable>

      {onDelete ? (
        <Pressable
          style={[
            styles.deleteBtn,
            { backgroundColor: theme.colors.dangerSoft },
          ]}
          onPress={onDelete}
          hitSlop={6}
          accessibilityLabel="Delete"
        >
          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    position: "relative",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardWithDelete: {
    paddingRight: 40,
  },
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  artWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  art: {
    width: 60,
    height: 60,
  },
  badge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    minWidth: 26,
    height: 26,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { fontSize: 13 },
  textBlock: { flex: 1 },
  title: { fontSize: 18, lineHeight: 22 },
  subtitle: { marginTop: 3, fontSize: 13 },
});
