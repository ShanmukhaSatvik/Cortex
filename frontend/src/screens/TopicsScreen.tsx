import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import ImageNavCard from "../components/ImageNavCard";
import { useAuth } from "../context/AuthContext";
import { listTopics } from "../services/api";
import { cardAccent, useTheme } from "../theme";
import { topicImage } from "../theme/subjectVisual";
import type { RootStackParamList, Topic } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Topics">;

export default function TopicsScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { handleAuthError } = useAuth();
  const [items, setItems] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listTopics(route.params.chapterId));
    } catch (e: any) {
      handleAuthError(e);
      setError(e?.message || "Failed to load topics");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, route.params.chapterId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <Screen
      title={route.params.chapterName}
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
            Dive into a topic.
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
            No topics yet.
          </Text>
        }
        renderItem={({ item, index }) => (
          <ImageNavCard
            title={item.name}
            subtitle="Lessons & animations"
            image={topicImage()}
            accent={cardAccent(theme, index)}
            badge={index + 1}
            onPress={() =>
              navigation.navigate("TopicContent", {
                topicId: item.id,
                topicName: item.name,
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
