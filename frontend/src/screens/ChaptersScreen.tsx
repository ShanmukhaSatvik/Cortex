import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import ImageNavCard from "../components/ImageNavCard";
import { useAuth } from "../context/AuthContext";
import { listChapters } from "../services/api";
import { cardAccent, useTheme } from "../theme";
import { chapterImage } from "../theme/subjectVisual";
import type { Chapter, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Chapters">;

export default function ChaptersScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { handleAuthError } = useAuth();
  const [items, setItems] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listChapters(route.params.subjectId));
    } catch (e: any) {
      handleAuthError(e);
      setError(e?.message || "Failed to load chapters");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, route.params.subjectId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <Screen
      title={route.params.subjectName}
      onBack={() => navigation.goBack()}
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
            Choose a chapter.
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
            No chapters yet.
          </Text>
        }
        renderItem={({ item, index }) => (
          <ImageNavCard
            title={item.name}
            subtitle="Open topics"
            image={chapterImage()}
            accent={cardAccent(theme, index)}
            badge={index + 1}
            onPress={() =>
              navigation.navigate("Topics", {
                chapterId: item.id,
                chapterName: item.name,
                gradeId: route.params.gradeId,
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
