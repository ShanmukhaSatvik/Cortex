import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import ImageNavCard from "../components/ImageNavCard";
import { useAuth } from "../context/AuthContext";
import { listSubjects } from "../services/api";
import { cardAccent, useTheme } from "../theme";
import { subjectImage } from "../theme/subjectVisual";
import type { RootStackParamList, Subject } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Subjects">;

export default function SubjectsScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { user, logout, handleAuthError } = useAuth();
  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gradeId =
    user?.role === "STUDENT" ? user.gradeId || route.params.gradeId : route.params.gradeId;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!gradeId) throw new Error("No grade assigned");
      setItems(await listSubjects(gradeId));
    } catch (e: any) {
      setItems([]);
      handleAuthError(e);
      setError(e?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }, [gradeId, handleAuthError]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const canGoBack = user?.role !== "STUDENT";

  return (
    <Screen
      title={route.params.gradeName || "Subjects"}
      onBack={canGoBack ? () => navigation.goBack() : undefined}
      rightIcon="log-out-outline"
      onRight={() => void logout().then(() => navigation.replace("Login"))}
      loading={loading}
      error={error}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
            Pick a subject to start exploring.
          </Text>
        }
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
            No subjects for this grade.
          </Text>
        }
        renderItem={({ item, index }) => (
          <ImageNavCard
            title={item.name}
            subtitle="Open chapters"
            image={subjectImage(item.name)}
            accent={cardAccent(theme, index)}
            onPress={() =>
              navigation.navigate("Chapters", {
                subjectId: item.id,
                subjectName: item.name,
                gradeId,
              })
            }
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  help: { marginBottom: 14, fontSize: 15 },
  empty: { textAlign: "center", marginTop: 40 },
});
