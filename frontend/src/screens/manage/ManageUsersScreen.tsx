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
import SegmentedTabs from "../../components/SegmentedTabs";
import ListCard from "../../components/ListCard";
import { useAuth } from "../../context/AuthContext";

import {
  createStudent,
  createTeacher,
  listClasses,
  listGrades,
  listStudents,
  listTeachers,
} from "../../services/api";
import type { ClassSection, Grade, RootStackParamList } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "ManageUsers">;
type Tab = "teachers" | "students";

export default function ManageUsersScreen({ navigation }: Props) {
  const { handleAuthError } = useAuth();
  const [tab, setTab] = useState<Tab>("teachers");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [classId, setClassId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, s, g] = await Promise.all([listTeachers(), listStudents(), listGrades()]);
      setTeachers(t);
      setStudents(s);
      setGrades(g);
      if (g[0]) {
        setGradeId(g[0].id);
        const cls = await listClasses(g[0].id);
        setClasses(cls);
        if (cls[0]) setClassId(cls[0].id);
      }
    } catch (e: any) {
      handleAuthError(e);
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onGradeChange = async (id: string) => {
    setGradeId(id);
    const cls = await listClasses(id);
    setClasses(cls);
    setClassId(cls[0]?.id || "");
  };

  const onCreate = async () => {
    try {
      if (tab === "teachers") {
        const teacher = await createTeacher(email.trim(), name.trim() || undefined);
        Alert.alert(
          "Teacher created",
          `Personal activation code: ${teacher.activationCode}`
        );
      } else {
        if (!gradeId || !classId) {
          Alert.alert("Missing", "Select grade and class");
          return;
        }
        const student = await createStudent({
          email: email.trim(),
          name: name.trim() || undefined,
          gradeId,
          classId,
        });
        Alert.alert(
          "Student created",
          `Personal activation code: ${student.activationCode}`
        );
      }
      setModal(false);
      setEmail("");
      setName("");
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Create failed");
    }
  };

  const data = tab === "teachers" ? teachers : students;

  return (
    <Screen title="Manage users" onBack={() => navigation.goBack()} loading={loading} error={error}>
      <SegmentedTabs
        items={[
          { key: "teachers", label: "Teachers" },
          { key: "students", label: "Students" },
        ]}
        value={tab}
        onChange={(key) => setTab(key as Tab)}
      />

      <Pressable style={styles.addBtn} onPress={() => setModal(true)}>
        <Text style={styles.addText}>
          + Add {tab === "teachers" ? "teacher" : "student"}
        </Text>
      </Pressable>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={<Text style={styles.empty}>No {tab} yet.</Text>}
        renderItem={({ item }) => (
          <ListCard
            title={item.name || item.email}
            subtitle={
              tab === "teachers"
                ? `${item.email} · ${item.role} · ${item.activationCode || "—"}`
                : `${item.email} · ${item.grade?.name || ""} ${item.class?.name || ""} · ${item.activationCode || "—"}`
            }
          />
        )}
      />

      <Modal visible={modal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              New {tab === "teachers" ? "teacher" : "student"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Name (optional)"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
            />
            {tab === "students" ? (
              <>
                <Text style={styles.label}>Grade</Text>
                <View style={styles.chips}>
                  {grades.map((g) => (
                    <Pressable
                      key={g.id}
                      style={[styles.chip, gradeId === g.id && styles.chipActive]}
                      onPress={() => void onGradeChange(g.id)}
                    >
                      <Text style={styles.chipText}>{g.name}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.label}>Class</Text>
                <View style={styles.chips}>
                  {classes.map((c) => (
                    <Pressable
                      key={c.id}
                      style={[styles.chip, classId === c.id && styles.chipActive]}
                      onPress={() => setClassId(c.id)}
                    >
                      <Text style={styles.chipText}>{c.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModal(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={onCreate}>
                <Text style={styles.saveText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#38bdf8",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },

  addText: { color: "#0f172a", fontWeight: "800" },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: 32 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 20, maxHeight: "90%" },
  modalTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  label: { color: "#94a3b8", marginBottom: 6, marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipActive: { backgroundColor: "#0369a1" },
  chipText: { color: "#e2e8f0", fontSize: 13 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    alignItems: "center",
    marginTop: 8,
  },
  cancel: { color: "#94a3b8", fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#38bdf8",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveText: { color: "#0f172a", fontWeight: "800" },
});
