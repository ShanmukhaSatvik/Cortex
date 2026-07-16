import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../../components/Screen";
import ListCard from "../../components/ListCard";
import { useAuth } from "../../context/AuthContext";
import { createSchool, listSchools } from "../../services/api";
import type { RootStackParamList, SchoolRow } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "Schools">;

export default function SchoolsScreen({ navigation }: Props) {
  const { logout, handleAuthError } = useAuth();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSchools(await listSchools());
    } catch (e: any) {
      handleAuthError(e);
      setError(e?.message || "Failed to load schools");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const school = await createSchool(name.trim());
      setModal(false);
      setName("");
      Alert.alert("School created", `Activation code: ${school.activationCode}`);
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Schools"
      rightIcon="log-out-outline"
      onRight={() => void logout().then(() => navigation.replace("Login"))}
      loading={loading}
      error={error}
    >
      <View style={styles.wrap}>
        <Pressable style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={styles.addText}>+ Create school</Text>
        </Pressable>
        <FlatList
          data={schools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No schools yet. Create one to begin.</Text>
          }
          renderItem={({ item }) => (
            <ListCard
              title={item.name}
              subtitle={`${item.isActive ? "Active" : "Inactive"} · Code ${item.activationCode || "—"} · Teachers ${item.stats.teacherCount} · Students ${item.stats.studentCount} · Logins ${item.stats.distinctLoginUsers}`}
              showChevron
              onPress={() =>
                navigation.navigate("SchoolDetail", {
                  schoolId: item.id,
                  schoolName: item.name,
                })
              }
            />

          )}
        />
      </View>

      <Modal visible={modal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New school</Text>
            <TextInput
              style={styles.input}
              placeholder="School name"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModal(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={onCreate} disabled={saving}>
                <Text style={styles.saveText}>{saving ? "..." : "Create"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  addBtn: {
    margin: 16,
    backgroundColor: "#38bdf8",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  addText: { color: "#0f172a", fontWeight: "800" },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20 },
  modalTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 16, alignItems: "center" },
  cancel: { color: "#94a3b8", fontWeight: "600" },
  saveBtn: { backgroundColor: "#38bdf8", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  saveText: { color: "#0f172a", fontWeight: "800" },
});
