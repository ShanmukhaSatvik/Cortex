import React, { useCallback, useState } from "react";
import { FlatList, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import ListCard from "../components/ListCard";
import { useAuth } from "../context/AuthContext";
import { listChapters } from "../services/api";
import type { Chapter, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Chapters">;

export default function ChaptersScreen({ navigation, route }: Props) {
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
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ color: "#94a3b8", textAlign: "center", marginTop: 40 }}>
            No chapters yet.
          </Text>
        }
        renderItem={({ item }) => (
          <ListCard
            title={item.name}
            right="Open"
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
