import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { WebView } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { fetchMediaBlobUrl, getToken, mediaUrl } from "../services/api";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "ContentViewer">;

export default function ContentViewerScreen({ navigation, route }: Props) {
  const { handleAuthError } = useAuth();
  const [uri, setUri] = useState<string | null>(null);
  const [headers, setHeaders] = useState<Record<string, string> | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

        if (route.params.type === "VIDEO") {
          if (!cancelled) {
            setHeaders(authHeaders);
            setUri(mediaUrl(route.params.contentId));
          }
        } else {
          objectUrl = await fetchMediaBlobUrl(route.params.contentId);
          if (!cancelled) setUri(objectUrl);
        }
      } catch (e: any) {
        handleAuthError(e);
        if (!cancelled) setError(e?.message || "Failed to load content");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [handleAuthError, route.params.contentId, route.params.type]);

  return (
    <Screen
      title={route.params.title}
      onBack={() => navigation.goBack()}
      loading={loading}
      error={error}
    >
      {uri && route.params.type === "VIDEO" ? (
        <Video
          style={styles.video}
          source={{ uri, headers }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
        />
      ) : null}

      {uri && route.params.type === "PDF" ? (
        <WebView
          style={styles.pdf}
          originWhitelist={["*"]}
          source={{
            html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body style="margin:0;background:#0f172a"><iframe src="${uri}" style="border:0;width:100%;height:100vh"></iframe></body></html>`,
          }}
        />
      ) : null}

      {!uri && !loading && !error ? (
        <View style={styles.center}>
          <ActivityIndicator color="#38bdf8" />
          <Text style={styles.hint}>Preparing viewer…</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  video: { flex: 1, backgroundColor: "#000" },
  pdf: { flex: 1, backgroundColor: "#0f172a" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hint: { color: "#94a3b8", marginTop: 12 },
});
