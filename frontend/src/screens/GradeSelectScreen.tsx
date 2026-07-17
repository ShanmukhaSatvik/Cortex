import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import ListCard from "../components/ListCard";
import { useAuth } from "../context/AuthContext";
import { listGrades } from "../services/api";
import type { Grade, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "GradeSelect">;

export default function GradeSelectScreen({ navigation }: Props) {
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
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Your activation code</Text>
            <Text style={styles.codeValue}>{user.activationCode || "—"}</Text>
            {user.schoolName ? (
              <Text style={styles.codeSchool}>{user.schoolName}</Text>
            ) : null}
            <Text style={styles.codeHint}>
              Use this personal code with your email to sign in. Each teacher and
              student gets their own code when you create them.
            </Text>
          </View>
          <Pressable
            style={styles.manageBtn}
            onPress={() => navigation.navigate("ManageUsers")}
          >
            <Text style={styles.manageText}>Manage teachers & students</Text>
          </Pressable>
        </>
      ) : null}

      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No grades available.</Text>}
        ListHeaderComponent={
          <Text style={styles.help}>Choose a grade to browse subjects and content.</Text>
        }
        renderItem={({ item }) => (
          <ListCard
            title={item.name}
            subtitle={`Level ${item.level}`}
            showChevron
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
  help: { color: "#94a3b8", marginBottom: 12 },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
  codeCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  codeLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  codeValue: {
    color: "#38bdf8",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  codeSchool: { color: "#e2e8f0", marginTop: 4, fontWeight: "600" },
  codeHint: { color: "#64748b", marginTop: 8, fontSize: 12, lineHeight: 17 },
  manageBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  manageText: { color: "#38bdf8", fontWeight: "700", textAlign: "center" },
});
