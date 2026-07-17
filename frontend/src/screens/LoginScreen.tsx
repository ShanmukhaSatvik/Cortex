import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme";
import type { AuthUser, RootStackParamList } from "../types";

const loginKids = require("../../assets/illustrations/login-kids.png");

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
type Tab = "admin" | "teacher" | "student";

const ROLES: {
  key: Tab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "student", label: "Student", icon: "happy" },
  { key: "teacher", label: "Teacher", icon: "school" },
  { key: "admin", label: "Admin", icon: "shield-checkmark" },
];

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
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const { platformLogin, codeLogin } = useAuth();
  const [tab, setTab] = useState<Tab>("student");
  const [email, setEmail] = useState("student1@greenwood.in");
  const [password, setPassword] = useState("admin123");
  const [activationCode, setActivationCode] = useState("C5R4T6");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const artHeight = Math.round(height * 0.38);

  const onTabChange = (t: Tab) => {
    setTab(t);
    setError(null);
    setShowPassword(false);
    if (t === "admin") {
      setEmail("admin@cortex.in");
      setPassword("admin123");
    } else if (t === "teacher") {
      setEmail("teacher1@greenwood.in");
      setActivationCode("B3P8Q1");
    } else {
      setEmail("student1@greenwood.in");
      setActivationCode("C5R4T6");
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
    <View style={[styles.root, { backgroundColor: theme.colors.surface }]}>
      {/* Zone 1: full-width kids art + brand */}
      <View style={[styles.artZone, { height: artHeight }]}>
        <Image source={loginKids} style={styles.art} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(15,155,142,0.15)", "rgba(15,155,142,0.85)"]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={["top"]} style={styles.brandSafe}>
          <Text style={[styles.brand, { fontFamily: theme.fonts.display }]}>
            Cortex
          </Text>
          <Text style={[styles.tagline, { fontFamily: theme.fonts.bodyBold }]}>
            Learn · Play · Grow
          </Text>
        </SafeAreaView>
      </View>

      {/* Zone 2: form panel */}
      <View
        style={[
          styles.formZone,
          {
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radii.xl,
            borderTopRightRadius: theme.radii.xl,
          },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.formScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text
              style={[
                styles.hello,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.display,
                },
              ]}
            >
              Hi there!
            </Text>

            <View style={styles.roles}>
              {ROLES.map((role) => {
                const active = tab === role.key;
                const color =
                  role.key === "student"
                    ? theme.colors.primary
                    : role.key === "teacher"
                      ? "#3B9AE1"
                      : theme.colors.accent;
                return (
                  <Pressable
                    key={role.key}
                    onPress={() => onTabChange(role.key)}
                    style={[
                      styles.role,
                      {
                        backgroundColor: active ? color : theme.colors.surfaceMuted,
                        borderColor: active ? color : theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={role.icon}
                      size={22}
                      color={active ? "#fff" : color}
                    />
                    <Text
                      style={[
                        styles.roleLabel,
                        {
                          color: active ? "#fff" : theme.colors.text,
                          fontFamily: theme.fonts.bodyBold,
                        },
                      ]}
                    >
                      {role.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

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
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {tab === "admin" ? (
              <View
                style={[
                  styles.passwordWrap,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.passwordInput,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.fonts.body,
                    },
                  ]}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              </View>
            ) : (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    fontFamily: theme.fonts.body,
                    letterSpacing: 2,
                  },
                ]}
                placeholder="Activation code"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="characters"
                value={activationCode}
                onChangeText={setActivationCode}
              />
            )}

            {error ? (
              <Text
                style={[
                  styles.error,
                  {
                    color: theme.colors.danger,
                    fontFamily: theme.fonts.bodyBold,
                  },
                ]}
              >
                {error}
              </Text>
            ) : (
              <View style={styles.errorSlot} />
            )}

            <Pressable
              style={[
                styles.button,
                { backgroundColor: theme.colors.accent },
              ]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    { fontFamily: theme.fonts.bodyBold },
                  ]}
                >
                  Let&apos;s go!
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  artZone: {
    width: "100%",
    overflow: "hidden",
  },
  art: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  brandSafe: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 48,
    letterSpacing: -1,
  },
  tagline: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    marginTop: 4,
  },
  formZone: {
    flex: 1,
    marginTop: -22,
    paddingTop: 8,
  },
  flex: { flex: 1 },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  hello: { fontSize: 26, marginBottom: 14 },
  roles: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  role: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  roleLabel: { fontSize: 12 },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 15,
  },
  passwordWrap: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  eyeBtn: { paddingHorizontal: 12 },
  error: { marginBottom: 8, fontSize: 13 },
  errorSlot: { height: 8 },
  button: {
    marginTop: 4,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 18 },
});
