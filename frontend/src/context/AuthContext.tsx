import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "../types";
import {
  clearSession,
  codeLogin as apiCodeLogin,
  fetchMe,
  getStoredUser,
  getToken,
  logoutApi,
  platformLogin as apiPlatformLogin,
  saveSession,
  ApiError,
} from "../services/api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  selectedGradeId: string | null;
  selectedGradeName: string | null;
  setSelectedGrade: (id: string, name: string) => void;
  platformLogin: (email: string, password: string) => Promise<AuthUser>;
  codeLogin: (
    email: string,
    activationCode: string,
    mode: "teacher" | "student"
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  handleAuthError: (error: unknown) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [selectedGradeName, setSelectedGradeName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const stored = await getStoredUser();
        if (!token || !stored) {
          setLoading(false);
          return;
        }
        const { user: me } = await fetchMe();
        setUser(me);
        if (me.role === "STUDENT" && me.gradeId) {
          setSelectedGradeId(me.gradeId);
        }
      } catch {
        await clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setSelectedGrade = useCallback((id: string, name: string) => {
    setSelectedGradeId(id);
    setSelectedGradeName(name);
  }, []);

  const platformLogin = useCallback(async (email: string, password: string) => {
    const data = await apiPlatformLogin(email, password);
    await saveSession(data.token, data.user);
    setUser(data.user);
    setSelectedGradeId(null);
    setSelectedGradeName(null);
    return data.user;
  }, []);

  const codeLogin = useCallback(
    async (email: string, activationCode: string, mode: "teacher" | "student") => {
      const data = await apiCodeLogin(email, activationCode, mode);
      await saveSession(data.token, data.user);
      setUser(data.user);
      if (data.user.role === "STUDENT" && data.user.gradeId) {
        setSelectedGradeId(data.user.gradeId);
        setSelectedGradeName(null);
      } else {
        setSelectedGradeId(null);
        setSelectedGradeName(null);
      }
      return data.user;
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutApi();
    await clearSession();
    setUser(null);
    setSelectedGradeId(null);
    setSelectedGradeName(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { user: me } = await fetchMe();
    setUser(me);
  }, []);

  const handleAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        void logout();
      }
    },
    [logout]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      selectedGradeId,
      selectedGradeName,
      setSelectedGrade,
      platformLogin,
      codeLogin,
      logout,
      refreshUser,
      handleAuthError,
    }),
    [
      user,
      loading,
      selectedGradeId,
      selectedGradeName,
      setSelectedGrade,
      platformLogin,
      codeLogin,
      logout,
      refreshUser,
      handleAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
