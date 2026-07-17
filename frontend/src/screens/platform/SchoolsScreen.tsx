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
import SchoolCard from "../../components/SchoolCard";
import { useAuth } from "../../context/AuthContext";
import { createSchool, listSchools } from "../../services/api";
import { cardAccent, useTheme } from "../../theme";
import type { RootStackParamList, SchoolRow } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "Schools">;

export default function SchoolsScreen({ navigation }: Props) {
  const theme = useTheme();
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
      await createSchool(name.trim());
      setModal(false);
      setName("");
      Alert.alert(
        "School created",
        "Open the school and assign a school admin to generate their personal activation code."
      );
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
            style={[
              styles.addText,
              {
                color: theme.colors.textOnAccent,
                fontFamily: theme.fonts.bodyBold,
              },
            ]}
          >
            + Create school
          </Text>
        </Pressable>
        <FlatList
          data={schools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
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
              No schools yet. Create one to begin.
            </Text>
          }
          renderItem={({ item, index }) => (
            <SchoolCard
              school={item}
              accent={cardAccent(theme, index)}
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
              style={[
                styles.modalTitle,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.display,
                },
              ]}
            >
              New school
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
              placeholder="School name"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />
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
                disabled={saving}
              >
                <Text
                  style={{
                    color: theme.colors.textOnAccent,
                    fontFamily: theme.fonts.bodyBold,
                  }}
                >
                  {saving ? "..." : "Create"}
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
  wrap: { flex: 1 },
  addBtn: {
    margin: 16,
    padding: 14,
    alignItems: "center",
  },
  addText: {},
  empty: { textAlign: "center", marginTop: 40 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(27, 42, 58, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { padding: 20 },
  modalTitle: { fontSize: 20, marginBottom: 12 },
  input: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    alignItems: "center",
  },
  saveBtn: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
