import React, { useCallback, useState } from "react";
import { FlatList, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import ListCard from "../components/ListCard";
import { useAuth } from "../context/AuthContext";
import { listTopics } from "../services/api";
import type { RootStackParamList, Topic } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Topics">;

export default function TopicsScreen({ navigation, route }: Props) {
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
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ color: "#94a3b8", textAlign: "center", marginTop: 40 }}>
            No topics yet.
          </Text>
        }
        renderItem={({ item }) => (
          <ListCard
            title={item.name}
            showChevron
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
