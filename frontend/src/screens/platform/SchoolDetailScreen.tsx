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
import { useTheme } from "../../theme";
import type { RootStackParamList, SchoolRow } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "SchoolDetail">;

export default function SchoolDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
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

  const cardStyle = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
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
          <View style={[styles.card, cardStyle]}>
            <Text
              style={[
                styles.label,
                {
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.bodyBold,
                },
              ]}
            >
              School admin activation code
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.display,
                },
              ]}
            >
              {school.activationCode || "Assign an admin first"}
            </Text>
            <Text
              style={[
                styles.label,
                {
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.bodyBold,
                },
              ]}
            >
              Status
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bodyBold,
                },
              ]}
            >
              {school.isActive ? "Active" : "Inactive"}
            </Text>
            <Pressable
              style={[
                styles.btnSecondary,
                { borderColor: theme.colors.primary },
              ]}
              onPress={toggleActive}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  fontFamily: theme.fonts.bodyBold,
                }}
              >
                {school.isActive ? "Deactivate school" : "Activate school"}
              </Text>
            </Pressable>
          </View>

          <View style={[styles.card, cardStyle]}>
            <Text
              style={[
                styles.section,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.display,
                },
              ]}
            >
              Sign-in stats
            </Text>
            {(
              [
                ["Teachers", school.stats.teacherCount],
                ["Students", school.stats.studentCount],
                ["School admins", school.stats.schoolAdminCount],
                ["Total logins", school.stats.loginCount],
                ["Distinct users signed in", school.stats.distinctLoginUsers],
              ] as const
            ).map(([label, value]) => (
              <Text
                key={label}
                style={{
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.body,
                  marginBottom: 4,
                }}
              >
                {label}: {value}
              </Text>
            ))}
          </View>

          <View style={[styles.card, cardStyle]}>
            <Text
              style={[
                styles.section,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.display,
                },
              ]}
            >
              Assign school admin
            </Text>
            <Text
              style={{
                color: theme.colors.textMuted,
                fontFamily: theme.fonts.body,
                marginBottom: 10,
                fontSize: 13,
              }}
            >
              Current: {school.schoolAdmin?.email || "None assigned"}
              {school.schoolAdmin?.activationCode
                ? ` · ${school.schoolAdmin.activationCode}`
                : ""}
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
              placeholder="School admin email"
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
              value={adminName}
              onChangeText={setAdminName}
            />
            <Pressable
              style={[styles.btn, { backgroundColor: theme.colors.accent }]}
              onPress={onAssign}
            >
              <Text
                style={{
                  color: theme.colors.textOnAccent,
                  fontFamily: theme.fonts.bodyBold,
                }}
              >
                Save school admin
              </Text>
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
    padding: 16,
    borderWidth: 1,
  },
  label: { fontSize: 12, marginTop: 8 },
  value: { fontSize: 18, marginTop: 2 },
  section: { fontSize: 18, marginBottom: 8 },
  input: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  btn: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  btnSecondary: {
    marginTop: 14,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
});
