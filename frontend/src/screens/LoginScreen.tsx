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
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import SegmentedTabs from "../components/SegmentedTabs";
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
  const [email, setEmail] = useState("admin@cortex.in");
  const [password, setPassword] = useState("admin123");
  const [activationCode, setActivationCode] = useState("SCHOOL26");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTabChange = (next: string) => {
    const t = next as Tab;
    setTab(t);
    setError(null);
    setShowPassword(false);
    if (t === "admin") {
      setEmail("admin@cortex.in");
      setPassword("admin123");
    } else if (t === "teacher") {
      setEmail("teacher1@greenwood.in");
      setActivationCode("SCHOOL26");
    } else {
      setEmail("student1@greenwood.in");
      setActivationCode("SCHOOL26");
    }
  };

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

      <View style={styles.card}>
        <SegmentedTabs
          items={[
            { key: "admin", label: "Admin" },
            { key: "teacher", label: "Teacher" },
            { key: "student", label: "Student" },
          ]}
          value={tab}
          onChange={onTabChange}
        />

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Fixed-height second field so tab switches don't jump */}
          <View style={styles.secondField}>
            {tab === "admin" ? (
              <View style={styles.passwordWrap}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#94a3b8"
                  />
                </Pressable>
              </View>
            ) : (
              <TextInput
                style={styles.inputInSlot}
                placeholder="Activation code"
                placeholderTextColor="#64748b"
                autoCapitalize="characters"
                value={activationCode}
                onChangeText={setActivationCode}
              />
            )}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : <View style={styles.errorSlot} />}

          <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>
      </View>
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
  subtitle: { color: "#94a3b8", marginBottom: 20, marginTop: 4 },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
  },
  form: { padding: 16 },
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
  secondField: {
    height: 52,
    marginBottom: 12,
  },
  inputInSlot: {
    flex: 1,
    height: 52,
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  passwordWrap: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  passwordInput: {
    flex: 1,
    color: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  error: { color: "#fca5a5", marginBottom: 8, minHeight: 20 },
  errorSlot: { height: 20, marginBottom: 8 },
  button: {
    backgroundColor: "#38bdf8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#0f172a", fontWeight: "800", fontSize: 16 },
});
