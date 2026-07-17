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



function isLoopbackUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Resolve API base at call-time (not module load).
 * Expo's LAN host is often empty on first import — caching that made phones
 * stick on http://localhost:3001 and hang forever while web still worked.
 */
function resolveApiUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim()?.replace(/\/$/, "") || "";
  const fromExtra = String(
    (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl || ""
  )
    .trim()
    .replace(/\/$/, "");

  const isBrowser = Platform.OS === "web";
  const onLocalHost =
    isBrowser &&
    typeof window !== "undefined" &&
    /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

  // Deployed website → production API (never localhost).
  if (isBrowser && !onLocalHost) {
    if (fromEnv && !isLoopbackUrl(fromEnv)) return fromEnv;
    if (fromExtra && !isLoopbackUrl(fromExtra)) return fromExtra;
    return "https://cortex-api-1s2s.onrender.com/api";
  }

  // Explicit non-local URL (e.g. Render) for any platform.
  if (fromEnv && !isLoopbackUrl(fromEnv)) return fromEnv;
  if (fromExtra && !isLoopbackUrl(fromExtra)) return fromExtra;

  // Local browser → localhost is fine.
  if (isBrowser) {
    return fromEnv || fromExtra || "http://localhost:3001/api";
  }

  // Native: never use localhost — the phone is not your PC.
  // Prefer Expo's Metro host (same Wi‑Fi as the phone).
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig
      ?.debuggerHost ||
    (Constants as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } })
      .manifest2?.extra?.expoClient?.hostUri ||
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost ||
    "";
  const lanHost = String(hostUri).split(":")[0]?.trim();

  if (lanHost && !isLoopbackUrl(lanHost)) {
    return `http://${lanHost}:3001/api`;
  }

  // Android emulator → host machine.
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3001/api";
  }

  // Last resort for a physical phone with no Metro host: production API
  // (same Neon DB). Avoids hanging on phone-localhost.
  return "https://cortex-api-1s2s.onrender.com/api";
}

/** Lazy — re-read Expo host each request so LAN IP is available after Metro connects. */
export function getApiUrl() {
  const url = resolveApiUrl();
  if (__DEV__) {
    // Helps diagnose web-vs-phone mismatches in the Metro / browser console.
    console.log("[cortex] API", url);
  }
  return url;
}

const TOKEN_KEY = "cortexToken";
const USER_KEY = "cortexUser";

/** In-memory session — SecureStore can lag/fail; API must still send Bearer. */
let memoryToken: string | null = null;
let memoryUser: AuthUser | null = null;

export const getApiBase = () => getApiUrl().replace(/\/api$/, "");

async function storageSet(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn("[cortex] SecureStore set failed", key, e);
  }
}

async function storageGet(key: string) {
  if (Platform.OS === "web") return localStorage.getItem(key);
  try {
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.warn("[cortex] SecureStore get failed", key, e);
    return null;
  }
}

async function storageDelete(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.warn("[cortex] SecureStore delete failed", key, e);
  }
}

export const saveSession = async (token: string, user: AuthUser) => {
  memoryToken = token;
  memoryUser = user;
  await storageSet(TOKEN_KEY, token);
  await storageSet(USER_KEY, JSON.stringify(user));
};

export const getToken = async () => {
  if (memoryToken) return memoryToken;
  const stored = await storageGet(TOKEN_KEY);
  if (stored) memoryToken = stored;
  return stored;
};

export const getStoredUser = async (): Promise<AuthUser | null> => {
  if (memoryUser) return memoryUser;
  const raw = await storageGet(USER_KEY);
  if (!raw) return null;
  try {
    memoryUser = JSON.parse(raw) as AuthUser;
    return memoryUser;
  } catch {
    return null;
  }
};

export const clearSession = async () => {
  memoryToken = null;
  memoryUser = null;
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

  const apiUrl = getApiUrl();

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers,
    });
  } catch (e: any) {
    const detail = e?.message || "Network request failed";
    throw new ApiError(
      `Cannot reach API (${apiUrl}). ${detail}. Phone and PC must share Wi‑Fi, backend on :3001, or set EXPO_PUBLIC_API_URL to your PC LAN IP.`,
      0
    );
  }

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
  request<{ id: string; name: string; activationCode: string | null }>("/schools", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const setSchoolActive = (id: string, isActive: boolean) =>
  request(`/schools/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });

export const assignSchoolAdmin = (id: string, email: string, name?: string) =>
  request<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    activationCode: string;
  }>(`/schools/${id}/school-admin`, {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });

export const listTeachers = () => request<any[]>("/users/teachers");
export const createTeacher = (email: string, name?: string) =>
  request<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    activationCode: string;
  }>("/users/teachers", {
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
  request<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    activationCode: string;
    gradeId: string;
    classId: string;
  }>("/users/students", {
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

function friendlyUploadError(raw: string, status?: number) {
  const msg = (raw || "").toLowerCase();
  if (msg.includes("formdatapart") || msg.includes("network request failed")) {
    return "Could not upload this file from the device. Try another PDF/video, or pick the file again.";
  }
  if (msg.includes("file too large") || status === 413) {
    return "File is too large. Please upload a smaller PDF or video (under 100MB).";
  }
  if (msg.includes("only staff") || msg.includes("forbidden") || status === 403) {
    return "You do not have permission to upload. Sign in as a teacher or school admin.";
  }
  if (status === 401) {
    return "Your session expired. Please sign in again, then retry the upload.";
  }
  if (!raw || msg.includes("upload failed")) {
    return "Upload failed. Check your connection and try again.";
  }
  return raw;
}

function uploadNativeMultipart(payload: {
  title: string;
  description?: string;
  type: ContentType;
  topicId: string;
  uri: string;
  fileName: string;
  mimeType: string;
  token: string | null;
}) {
  return new Promise<ContentItem>((resolve, reject) => {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.description) form.append("description", payload.description);
    form.append("type", payload.type);
    form.append("topicId", payload.topicId);
    form.append("file", {
      uri: payload.uri,
      name: payload.fileName,
      type: payload.mimeType,
    } as any);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${getApiUrl()}/content`);
    if (payload.token) {
      xhr.setRequestHeader("Authorization", `Bearer ${payload.token}`);
    }
    xhr.onload = () => {
      let data: any = {};
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        data = { message: xhr.responseText };
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve((data.content || data) as ContentItem);
        return;
      }
      reject(
        new ApiError(
          friendlyUploadError(data?.message || "Upload failed", xhr.status),
          xhr.status
        )
      );
    };
    xhr.onerror = () => {
      reject(
        new ApiError(
          friendlyUploadError("Network request failed"),
          0
        )
      );
    };
    xhr.send(form);
  });
}

export const uploadContent = async (payload: {
  title: string;
  description?: string;
  type: ContentType;
  topicId: string;
  uri: string;
  fileName: string;
  mimeType?: string;
  webFile?: File;
}) => {
  const token = await getToken();
  const mime =
    payload.mimeType ||
    (payload.type === "PDF" ? "application/pdf" : "video/mp4");

  try {
    if (Platform.OS === "web") {
      const form = new FormData();
      form.append("title", payload.title);
      if (payload.description) form.append("description", payload.description);
      form.append("type", payload.type);
      form.append("topicId", payload.topicId);

      let filePart: Blob | File = payload.webFile as File;
      if (!filePart) {
        const res = await fetch(payload.uri);
        if (!res.ok) {
          throw new ApiError("Could not read the selected file in the browser.", 0);
        }
        filePart = await res.blob();
      }
      form.append(
        "file",
        filePart instanceof File
          ? filePart
          : new File([filePart], payload.fileName, { type: mime })
      );

      const response = await fetch(`${getApiUrl()}/content`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new ApiError(
          friendlyUploadError(data?.message || "Upload failed", response.status),
          response.status
        );
      }
      return data as ContentItem;
    }

    // Native: XMLHttpRequest avoids fetch's "Unsupported FormDataPart" on Android
    return await uploadNativeMultipart({
      ...payload,
      mimeType: mime,
      token,
    });
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      friendlyUploadError(e?.message || "Upload failed"),
      e?.status || 0
    );
  }
};

export const deleteContent = (id: string) =>
  request(`/content/${id}`, { method: "DELETE" });

/** Optional token query — Android expo-video often cannot send Authorization headers. */
export const mediaUrl = (contentId: string, token?: string | null) => {
  const base = `${getApiUrl()}/content/media/${contentId}`;
  if (!token) return base;
  return `${base}?token=${encodeURIComponent(token)}`;
};

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(binary);
  }
  // Expo / Hermes fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Buf = (globalThis as any).Buffer;
  if (Buf) return Buf.from(bytes).toString("base64");
  throw new Error("Base64 encoding is not available on this platform.");
}

const pdfBase64Cache = new Map<string, string>();

/** Load PDF as base64 — avoids RN Blob/createObjectURL (unsupported on Android). */
export const fetchPdfBase64 = async (contentId: string) => {
  const cached = pdfBase64Cache.get(contentId);
  if (cached) return cached;

  const token = await getToken();
  const response = await fetch(mediaUrl(contentId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new ApiError("Failed to load PDF", response.status);
  const buffer = await response.arrayBuffer();
  const base64 = bytesToBase64(new Uint8Array(buffer));
  pdfBase64Cache.set(contentId, base64);
  return base64;
};


export { ApiError };
