import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import type { AuthUser, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
type Tab = "admin" | "teacher" | "student";

function routeAfterLogin(user: AuthUser, navigation: Props["navigation"]) {
  if (user.role === "PLATFORM_ADMIN") {
    navigation.replace("Schools");
    return;
  }
  if (user.role === "STUDENT") {
    navigation.replace("Subjects", {
      gradeId: user.gradeId || "",
      gradeName: "My Grade",
    });
    return;
  }
  navigation.replace("GradeSelect");
}

export default function LoginScreen({ navigation }: Props) {
  const { platformLogin, codeLogin } = useAuth();
  const [tab, setTab] = useState<Tab>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (tab === "admin") {
        const user = await platformLogin(email.trim(), password);
        routeAfterLogin(user, navigation);
      } else {
        const user = await codeLogin(
          email.trim(),
          activationCode.trim(),
          tab === "teacher" ? "teacher" : "student"
        );
        routeAfterLogin(user, navigation);
      }
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.brand}>Cortex</Text>
      <Text style={styles.subtitle}>School content platform</Text>

      <View style={styles.tabs}>
        {(["admin", "teacher", "student"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => {
              setTab(t);
              setError(null);
            }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "admin" ? "Admin" : t === "teacher" ? "Teacher" : "Student"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.hint}>
        {tab === "admin"
          ? "Platform admin — email + password"
          : tab === "teacher"
            ? "Teachers & school admins — email + school code"
            : "Students — email + school code"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {tab === "admin" ? (
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Activation code"
          placeholderTextColor="#64748b"
          autoCapitalize="characters"
          value={activationCode}
          onChangeText={setActivationCode}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
    justifyContent: "center",
  },
  brand: {
    color: "#f8fafc",
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: { color: "#94a3b8", marginBottom: 28, marginTop: 4 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#0ea5e9" },
  tabText: { color: "#94a3b8", fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: "#0f172a" },
  hint: { color: "#64748b", marginBottom: 12, fontSize: 13 },
  input: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  button: {
    backgroundColor: "#38bdf8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#0f172a", fontWeight: "800", fontSize: 16 },
  error: { color: "#fca5a5", marginBottom: 8 },
});
