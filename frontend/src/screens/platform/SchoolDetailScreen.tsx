import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../../components/Screen";
import { useAuth } from "../../context/AuthContext";
import { assignSchoolAdmin, listSchools, setSchoolActive } from "../../services/api";
import type { RootStackParamList, SchoolRow } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "SchoolDetail">;

export default function SchoolDetailScreen({ navigation, route }: Props) {
  const { handleAuthError } = useAuth();
  const [school, setSchool] = useState<SchoolRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [adminName, setAdminName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const schools = await listSchools();
      const found = schools.find((s) => s.id === route.params.schoolId) || null;
      setSchool(found);
      if (found?.schoolAdmin?.email) setEmail(found.schoolAdmin.email);
    } catch (e: any) {
      handleAuthError(e);
      setError(e?.message || "Failed to load school");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, route.params.schoolId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const toggleActive = async () => {
    if (!school) return;
    try {
      await setSchoolActive(school.id, !school.isActive);
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Update failed");
    }
  };

  const onAssign = async () => {
    if (!school || !email.trim()) return;
    try {
      const admin = await assignSchoolAdmin(
        school.id,
        email.trim(),
        adminName.trim() || undefined
      );
      Alert.alert(
        "School admin assigned",
        `Personal activation code: ${admin.activationCode}\n\nThey sign in on the Teacher tab with their email and this code.`
      );
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Assign failed");
    }
  };

  return (
    <Screen
      title={route.params.schoolName}
      onBack={() => navigation.goBack()}
      loading={loading}
      error={error || (!school ? "School not found" : null)}
    >
      {school ? (
        <View style={styles.wrap}>
          <View style={styles.card}>
            <Text style={styles.label}>School admin activation code</Text>
            <Text style={styles.value}>{school.activationCode || "Assign an admin first"}</Text>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{school.isActive ? "Active" : "Inactive"}</Text>
            <Pressable style={styles.btnSecondary} onPress={toggleActive}>
              <Text style={styles.btnSecondaryText}>
                {school.isActive ? "Deactivate school" : "Activate school"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>Sign-in stats</Text>
            <Text style={styles.stat}>Teachers: {school.stats.teacherCount}</Text>
            <Text style={styles.stat}>Students: {school.stats.studentCount}</Text>
            <Text style={styles.stat}>School admins: {school.stats.schoolAdminCount}</Text>
            <Text style={styles.stat}>Total logins: {school.stats.loginCount}</Text>
            <Text style={styles.stat}>Distinct users signed in: {school.stats.distinctLoginUsers}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>Assign school admin</Text>
            <Text style={styles.help}>
              Current: {school.schoolAdmin?.email || "None assigned"}
              {school.schoolAdmin?.activationCode
                ? ` · ${school.schoolAdmin.activationCode}`
                : ""}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="School admin email"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Name (optional)"
              placeholderTextColor="#64748b"
              value={adminName}
              onChangeText={setAdminName}
            />
            <Pressable style={styles.btn} onPress={onAssign}>
              <Text style={styles.btnText}>Save school admin</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
  },
  label: { color: "#94a3b8", fontSize: 12, marginTop: 8 },
  value: { color: "#f8fafc", fontSize: 16, fontWeight: "700", marginTop: 2 },
  section: { color: "#f8fafc", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  stat: { color: "#cbd5e1", marginBottom: 4 },
  help: { color: "#94a3b8", marginBottom: 10, fontSize: 13 },
  input: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#38bdf8",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  btnText: { color: "#0f172a", fontWeight: "800" },
  btnSecondary: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#38bdf8",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  btnSecondaryText: { color: "#38bdf8", fontWeight: "700" },
});
