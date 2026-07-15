import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";
import type {
  AuthUser,
  Chapter,
  ClassSection,
  ContentItem,
  ContentType,
  Grade,
  SchoolRow,
  Subject,
  Topic,
} from "../types";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
  "http://localhost:3001/api";

const TOKEN_KEY = "cortexToken";
const USER_KEY = "cortexUser";

export const getApiBase = () => API_URL.replace(/\/api$/, "");

async function storageSet(key: string, value: string) {
  if (Platform.OS === "web") localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
}

async function storageGet(key: string) {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function storageDelete(key: string) {
  if (Platform.OS === "web") localStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}

export const saveSession = async (token: string, user: AuthUser) => {
  await storageSet(TOKEN_KEY, token);
  await storageSet(USER_KEY, JSON.stringify(user));
};

export const getToken = () => storageGet(TOKEN_KEY);

export const getStoredUser = async (): Promise<AuthUser | null> => {
  const raw = await storageGet(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const clearSession = async () => {
  await storageDelete(TOKEN_KEY);
  await storageDelete(USER_KEY);
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new ApiError(data?.message || "Request failed", response.status);
  }
  return data as T;
}

export const platformLogin = (email: string, password: string) =>
  request<{ token: string; user: AuthUser }>("/auth/platform-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const codeLogin = (
  email: string,
  activationCode: string,
  mode: "teacher" | "student"
) =>
  request<{ token: string; user: AuthUser }>("/auth/code-login", {
    method: "POST",
    body: JSON.stringify({ email, activationCode, mode }),
  });

export const fetchMe = () => request<{ user: AuthUser }>("/auth/me");

export const logoutApi = () =>
  request<{ success: boolean }>("/auth/logout", { method: "POST" }).catch(() => ({
    success: true,
  }));

export const listSchools = () => request<SchoolRow[]>("/schools");

export const createSchool = (name: string) =>
  request<{ id: string; name: string; activationCode: string }>("/schools", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const setSchoolActive = (id: string, isActive: boolean) =>
  request(`/schools/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });

export const assignSchoolAdmin = (id: string, email: string, name?: string) =>
  request(`/schools/${id}/school-admin`, {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });

export const listTeachers = () => request<any[]>("/users/teachers");
export const createTeacher = (email: string, name?: string) =>
  request("/users/teachers", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });

export const listStudents = () => request<any[]>("/users/students");
export const createStudent = (payload: {
  email: string;
  name?: string;
  gradeId: string;
  classId: string;
}) =>
  request("/users/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listGrades = () => request<Grade[]>("/catalog/grades");
export const listClasses = (gradeId: string) =>
  request<ClassSection[]>(`/catalog/classes/${gradeId}`);
export const listSubjects = (gradeId: string) =>
  request<Subject[]>(`/catalog/subjects?gradeId=${encodeURIComponent(gradeId)}`);
export const listChapters = (subjectId: string) =>
  request<Chapter[]>(`/catalog/chapters/${subjectId}`);
export const listTopics = (chapterId: string) =>
  request<Topic[]>(`/catalog/topics/${chapterId}`);

export const listContent = (topicId: string, type?: ContentType) => {
  const q = new URLSearchParams({ topicId });
  if (type) q.set("type", type);
  return request<ContentItem[]>(`/content?${q.toString()}`);
};

export const uploadContent = async (payload: {
  title: string;
  description?: string;
  type: ContentType;
  topicId: string;
  uri: string;
  fileName: string;
  mimeType?: string;
}) => {
  const token = await getToken();
  const form = new FormData();
  form.append("title", payload.title);
  if (payload.description) form.append("description", payload.description);
  form.append("type", payload.type);
  form.append("topicId", payload.topicId);

  if (Platform.OS === "web") {
    const blob = await (await fetch(payload.uri)).blob();
    form.append("file", blob, payload.fileName);
  } else {
    form.append("file", {
      uri: payload.uri,
      name: payload.fileName,
      type: payload.mimeType || "application/octet-stream",
    } as any);
  }

  const response = await fetch(`${API_URL}/content`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data?.message || "Upload failed", response.status);
  return data as ContentItem;
};

export const deleteContent = (id: string) =>
  request(`/content/${id}`, { method: "DELETE" });

export const mediaUrl = (contentId: string) => `${API_URL}/content/media/${contentId}`;

export const fetchMediaBlobUrl = async (contentId: string) => {
  const token = await getToken();
  const response = await fetch(mediaUrl(contentId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new ApiError("Failed to load media", response.status);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export { ApiError };
