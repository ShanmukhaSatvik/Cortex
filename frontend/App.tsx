import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
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

function RootNavigator() {
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) setReady(true);
  }, [loading]);

  if (!ready || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center" }}>
        <ActivityIndicator color="#38bdf8" size="large" />
      </View>
    );
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
      key={user ? `${user.id}-${user.role}` : "guest"}
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
  return (
    <AuthProvider>
      <MobileShell>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </MobileShell>
    </AuthProvider>
  );
}
