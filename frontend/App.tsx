import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { Fredoka_600SemiBold } from "@expo-google-fonts/fredoka";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/theme";
import MobileShell from "./src/components/MobileShell";
import type { RootStackParamList } from "./src/types";

import LoginScreen from "./src/screens/LoginScreen";
import SchoolsScreen from "./src/screens/platform/SchoolsScreen";
import SchoolDetailScreen from "./src/screens/platform/SchoolDetailScreen";
import ManageUsersScreen from "./src/screens/manage/ManageUsersScreen";
import GradeSelectScreen from "./src/screens/GradeSelectScreen";
import SubjectsScreen from "./src/screens/SubjectsScreen";
import ChaptersScreen from "./src/screens/ChaptersScreen";
import TopicsScreen from "./src/screens/TopicsScreen";
import TopicContentScreen from "./src/screens/TopicContentScreen";
import ContentViewerScreen from "./src/screens/ContentViewerScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function BootSplash() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bgTop,
        justifyContent: "center",
      }}
    >
      <ActivityIndicator color={theme.colors.primary} size="large" />
    </View>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (!loading) setBooted(true);
  }, [loading]);

  if (!booted || loading) {
    return <BootSplash />;
  }

  const initialRoute = !user
    ? "Login"
    : user.role === "PLATFORM_ADMIN"
      ? "Schools"
      : user.role === "STUDENT"
        ? "Subjects"
        : "GradeSelect";

  return (
    <Stack.Navigator
      key={user ? `${user.role}-${user.id}` : "guest"}
      initialRouteName={initialRoute as keyof RootStackParamList}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Schools" component={SchoolsScreen} />
      <Stack.Screen name="SchoolDetail" component={SchoolDetailScreen} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="GradeSelect" component={GradeSelectScreen} />
      <Stack.Screen
        name="Subjects"
        component={SubjectsScreen}
        initialParams={
          user?.role === "STUDENT"
            ? { gradeId: user.gradeId || "", gradeName: "Subjects" }
            : { gradeId: "", gradeName: "Subjects" }
        }
      />
      <Stack.Screen name="Chapters" component={ChaptersScreen} />
      <Stack.Screen name="Topics" component={TopicsScreen} />
      <Stack.Screen name="TopicContent" component={TopicContentScreen} />
      <Stack.Screen name="ContentViewer" component={ContentViewerScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Fredoka_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#D9F1FF", justifyContent: "center" }}>
        <ActivityIndicator color="#0F9B8E" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider flavorId="cortex-kids">
        <AuthProvider>
          <MobileShell>
            <NavigationContainer>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </MobileShell>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
