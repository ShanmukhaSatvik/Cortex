import React, { useCallback, useState } from "react";
import { FlatList, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import ListCard from "../components/ListCard";
import { useAuth } from "../context/AuthContext";
import { listSubjects } from "../services/api";
import type { RootStackParamList, Subject } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Subjects">;

export default function SubjectsScreen({ navigation, route }: Props) {
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
      rightLabel="Logout"
      onRight={() => void logout().then(() => navigation.replace("Login"))}
      loading={loading}
      error={error}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ color: "#94a3b8", textAlign: "center", marginTop: 40 }}>
            No subjects for this grade.
          </Text>
        }
        renderItem={({ item }) => (
          <ListCard
            title={item.name}
            right="Open"
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
