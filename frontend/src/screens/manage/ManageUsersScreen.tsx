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
import { cardAccent, useTheme } from "../../theme";
import type { ClassSection, Grade, RootStackParamList } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "ManageUsers">;
type Tab = "teachers" | "students";

export default function ManageUsersScreen({ navigation }: Props) {
  const theme = useTheme();
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
      <View style={styles.tabsPad}>
        <SegmentedTabs
          items={[
            { key: "teachers", label: "Teachers" },
            { key: "students", label: "Students" },
          ]}
          value={tab}
          onChange={(key) => setTab(key as Tab)}
        />
      </View>

      <Pressable
        style={[
          styles.addBtn,
          {
            backgroundColor: theme.colors.accent,
            borderRadius: theme.radii.md,
          },
        ]}
        onPress={() => setModal(true)}
      >
        <Text
          style={{
            color: theme.colors.textOnAccent,
            fontFamily: theme.fonts.bodyBold,
          }}
        >
          + Add {tab === "teachers" ? "teacher" : "student"}
        </Text>
      </Pressable>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.colors.textMuted,
              fontFamily: theme.fonts.body,
              textAlign: "center",
              marginTop: 32,
            }}
          >
            No {tab} yet.
          </Text>
        }
        renderItem={({ item, index }) => (
          <ListCard
            title={item.name || item.email}
            subtitle={
              tab === "teachers"
                ? `${item.email} · ${item.role} · ${item.activationCode || "—"}`
                : `${item.email} · ${item.grade?.name || ""} ${item.class?.name || ""} · ${item.activationCode || "—"}`
            }
            accent={cardAccent(theme, index)}
            icon={tab === "teachers" ? "person-outline" : "happy-outline"}
          />
        )}
      />

      <Modal visible={modal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontFamily: theme.fonts.display,
                fontSize: 20,
                marginBottom: 12,
              }}
            >
              New {tab === "teachers" ? "teacher" : "student"}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  fontFamily: theme.fonts.body,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceMuted,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  fontFamily: theme.fonts.body,
                },
              ]}
              placeholder="Name (optional)"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            {tab === "students" ? (
              <>
                <Text
                  style={{
                    color: theme.colors.textMuted,
                    fontFamily: theme.fonts.bodyBold,
                    marginBottom: 6,
                    marginTop: 4,
                  }}
                >
                  Grade
                </Text>
                <View style={styles.chips}>
                  {grades.map((g) => (
                    <Pressable
                      key={g.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            gradeId === g.id
                              ? theme.colors.primary
                              : theme.colors.surfaceMuted,
                        },
                      ]}
                      onPress={() => void onGradeChange(g.id)}
                    >
                      <Text
                        style={{
                          color:
                            gradeId === g.id
                              ? theme.colors.textOnAccent
                              : theme.colors.text,
                          fontFamily: theme.fonts.bodyBold,
                          fontSize: 13,
                        }}
                      >
                        {g.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text
                  style={{
                    color: theme.colors.textMuted,
                    fontFamily: theme.fonts.bodyBold,
                    marginBottom: 6,
                    marginTop: 4,
                  }}
                >
                  Class
                </Text>
                <View style={styles.chips}>
                  {classes.map((c) => (
                    <Pressable
                      key={c.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            classId === c.id
                              ? theme.colors.primary
                              : theme.colors.surfaceMuted,
                        },
                      ]}
                      onPress={() => setClassId(c.id)}
                    >
                      <Text
                        style={{
                          color:
                            classId === c.id
                              ? theme.colors.textOnAccent
                              : theme.colors.text,
                          fontFamily: theme.fonts.bodyBold,
                          fontSize: 13,
                        }}
                      >
                        {c.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModal(false)}>
                <Text
                  style={{
                    color: theme.colors.textMuted,
                    fontFamily: theme.fonts.bodyBold,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveBtn,
                  { backgroundColor: theme.colors.accent },
                ]}
                onPress={onCreate}
              >
                <Text
                  style={{
                    color: theme.colors.textOnAccent,
                    fontFamily: theme.fonts.bodyBold,
                  }}
                >
                  Create
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabsPad: { paddingHorizontal: 16, paddingTop: 12 },
  addBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(27, 42, 58, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { padding: 20, maxHeight: "90%" },
  input: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtn: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
