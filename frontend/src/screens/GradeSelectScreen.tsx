import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import GradeCard from "../components/GradeCard";
import { useAuth } from "../context/AuthContext";
import { listGrades } from "../services/api";
import { cardAccent, useTheme } from "../theme";
import type { Grade, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "GradeSelect">;

export default function GradeSelectScreen({ navigation }: Props) {
  const theme = useTheme();
  const { user, logout, setSelectedGrade, handleAuthError } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setGrades(await listGrades());
    } catch (e: any) {
      setGrades([]);
      handleAuthError(e);
      setError(e?.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <Screen
      title="Select grade"
      rightIcon="log-out-outline"
      onRight={() => void logout().then(() => navigation.replace("Login"))}
      loading={loading}
      error={error}
    >
      {user?.role === "SCHOOL_ADMIN" ? (
        <>
          <View
            style={[
              styles.codeCard,
              {
                backgroundColor: theme.colors.sunSoft,
                borderColor: theme.colors.sun,
                borderRadius: theme.radii.md,
              },
            ]}
          >
            <Text
              style={[
                styles.codeLabel,
                {
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.bodyBold,
                },
              ]}
            >
              Your activation code
            </Text>
            <Text
              style={[
                styles.codeValue,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.display,
                },
              ]}
            >
              {user.activationCode || "—"}
            </Text>
            {user.schoolName ? (
              <Text
                style={[
                  styles.codeSchool,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bodyBold,
                  },
                ]}
              >
                {user.schoolName}
              </Text>
            ) : null}
            <Text
              style={[
                styles.codeHint,
                {
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.body,
                },
              ]}
            >
              Use this personal code with your email to sign in. Each teacher and
              student gets their own code when you create them.
            </Text>
          </View>
          <Pressable
            style={[
              styles.manageBtn,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.md,
              },
            ]}
            onPress={() => navigation.navigate("ManageUsers")}
          >
            <Text
              style={[
                styles.manageText,
                {
                  color: theme.colors.textOnAccent,
                  fontFamily: theme.fonts.bodyBold,
                },
              ]}
            >
              Manage teachers & students
            </Text>
          </Pressable>
        </>
      ) : null}

      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text
            style={[
              styles.empty,
              {
                color: theme.colors.textMuted,
                fontFamily: theme.fonts.body,
              },
            ]}
          >
            No grades available.
          </Text>
        }
        ListHeaderComponent={
          <Text
            style={[
              styles.help,
              {
                color: theme.colors.textMuted,
                fontFamily: theme.fonts.body,
              },
            ]}
          >
            Choose a grade to browse subjects and content.
          </Text>
        }
        renderItem={({ item, index }) => (
          <GradeCard
            name={item.name}
            level={item.level}
            accent={cardAccent(theme, index)}
            onPress={() => {
              setSelectedGrade(item.id, item.name);
              navigation.navigate("Subjects", {
                gradeId: item.id,
                gradeName: item.name,
              });
            }}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  help: { marginBottom: 12, fontSize: 15 },
  empty: { textAlign: "center", marginTop: 40 },
  codeCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderWidth: 1.5,
  },
  codeLabel: { fontSize: 12 },
  codeValue: {
    fontSize: 26,
    letterSpacing: 2,
    marginTop: 4,
  },
  codeSchool: { marginTop: 4 },
  codeHint: { marginTop: 8, fontSize: 12, lineHeight: 17 },
  manageBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 15,
  },
  manageText: { textAlign: "center", fontSize: 15 },
});
