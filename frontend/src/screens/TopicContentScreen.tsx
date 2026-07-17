import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import SegmentedTabs from "../components/SegmentedTabs";
import ListCard from "../components/ListCard";
import { useAuth } from "../context/AuthContext";
import { deleteContent, listContent, uploadContent } from "../services/api";
import type { ContentItem, ContentType, RootStackParamList } from "../types";
import { displayContentTitle } from "../utils/youtube";

type Props = NativeStackScreenProps<RootStackParamList, "TopicContent">;
type Tab = "VIDEO" | "PDF";

function notify(title: string, message?: string) {
  const text = message ? `${title}\n${message}` : title;
  if (Platform.OS === "web") {
    // Alert.alert is unreliable on RN web
    window.alert(text);
    return;
  }
  Alert.alert(title, message);
}
export default function TopicContentScreen({ navigation, route }: Props) {
  const { user, handleAuthError } = useAuth();
  const canEdit = user?.role === "TEACHER" || user?.role === "SCHOOL_ADMIN";
  const [tab, setTab] = useState<Tab>("VIDEO");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(
    async (mode: "full" | "soft" = "full") => {
      if (mode === "full") setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        setItems(await listContent(route.params.topicId, tab));
      } catch (e: any) {
        handleAuthError(e);
        setError(e?.message || "Failed to load content");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [handleAuthError, route.params.topicId, tab]
  );

  useFocusEffect(
    useCallback(() => {
      void load("soft");
    }, [load])
  );

  const onTabChange = (key: string) => {
    if (key === tab) return;
    setTitle("");
    setTab(key as Tab);
  };

  const onUpload = async () => {
    if (!title.trim()) {
      notify("Title required", "Enter a title before uploading.");
      return;
    }
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: tab === "PDF" ? ["application/pdf"] : ["video/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled || !picked.assets?.[0]) return;
      const asset = picked.assets[0];
      const fileName =
        asset.name ||
        (tab === "PDF" ? `lesson-${Date.now()}.pdf` : `animation-${Date.now()}.mp4`);
      const mimeType =
        asset.mimeType ||
        (tab === "PDF" ? "application/pdf" : "video/mp4");

      setUploading(true);
      await uploadContent({
        title: title.trim(),
        type: tab as ContentType,
        topicId: route.params.topicId,
        uri: asset.uri,
        fileName,
        mimeType,
        // Web picker provides a real File — more reliable than blob: URLs
        webFile: (asset as { file?: File }).file,
      });
      setTitle("");
      notify("Uploaded", `${tab === "PDF" ? "PDF" : "Animation"} added to this topic.`);
      await load("soft");
    } catch (e: any) {
      const kind = tab === "PDF" ? "PDF" : "animation";
      notify(
        "Upload failed",
        e?.message ||
          `Could not upload this ${kind}. Teachers and school admins can upload files here — try picking the file again.`
      );
    } finally {
      setUploading(false);
    }
  };

  const onDelete = (item: ContentItem) => {
    const runDelete = async () => {
      try {
        await deleteContent(item.id);
        await load("soft");
      } catch (e: any) {
        notify("Error", e?.message || "Delete failed");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Delete "${item.title}"?`)) {
        void runDelete();
      }
      return;
    }

    Alert.alert("Delete", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void runDelete();
        },
      },
    ]);
  };

  return (
    <Screen title={route.params.topicName} onBack={() => navigation.goBack()}>
      <SegmentedTabs
        items={[
          { key: "VIDEO", label: "Animations" },
          { key: "PDF", label: "PDFs" },
        ]}
        value={tab}
        onChange={onTabChange}
      />

      {canEdit ? (
        <View style={styles.uploadBox}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#64748b"
            value={title}
            onChangeText={setTitle}
          />
          <Pressable style={styles.uploadBtn} onPress={onUpload} disabled={uploading}>
            <Text style={styles.uploadText}>{uploading ? "…" : "Upload"}</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading || refreshing ? (
        <View style={styles.listLoader}>
          <ActivityIndicator color="#38bdf8" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No {tab === "VIDEO" ? "animations" : "PDFs"} yet.
            </Text>
          }
          renderItem={({ item }) => (
            <ListCard
              title={displayContentTitle(item.title)}
              subtitle={tab === "VIDEO" ? "Animation" : "PDF"}
              onPress={() =>
                navigation.navigate("ContentViewer", {
                  contentId: item.id,
                  title: displayContentTitle(item.title),
                  type: item.type,
                  externalUrl: item.externalUrl ?? null,
                })
              }
              onDelete={canEdit ? () => onDelete(item) : undefined}
            />
          )}
        />
      )}
    </Screen>
  );
}



const styles = StyleSheet.create({
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  uploadBtn: {
    backgroundColor: "#38bdf8",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  uploadText: { color: "#0f172a", fontWeight: "800" },
  list: { padding: 16, paddingBottom: 32 },
  listLoader: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
  error: { color: "#fca5a5", paddingHorizontal: 16, paddingTop: 8 },
});


