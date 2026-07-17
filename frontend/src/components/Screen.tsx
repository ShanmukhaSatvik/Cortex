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
import PlayfulBackground from "./PlayfulBackground";
import { useTheme } from "../theme";

type Props = {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
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
  const theme = useTheme();

  return (
    <PlayfulBackground>
      <SafeAreaView style={styles.safe}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={[
                styles.sideBtn,
                { backgroundColor: theme.colors.primarySoft },
              ]}
              hitSlop={8}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={theme.colors.primary}
              />
            </Pressable>
          ) : (
            <View style={styles.sideBtn} />
          )}
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontFamily: theme.fonts.display,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {rightIcon && onRight ? (
            <Pressable
              onPress={onRight}
              style={[
                styles.sideBtn,
                { backgroundColor: theme.colors.accentSoft },
              ]}
              hitSlop={8}
            >
              <Ionicons name={rightIcon} size={20} color={theme.colors.accent} />
            </Pressable>
          ) : (
            <View style={styles.sideBtn} />
          )}
        </View>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text
              style={[
                styles.error,
                {
                  color: theme.colors.danger,
                  fontFamily: theme.fonts.bodyBold,
                },
              ]}
            >
              {error}
            </Text>
          </View>
        ) : (
          <View style={styles.body}>{children}</View>
        )}
      </SafeAreaView>
    </PlayfulBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
  },
  sideBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  error: { textAlign: "center", fontSize: 15 },
});
