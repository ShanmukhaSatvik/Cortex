import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
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
import ListCard from "../components/ListCard";
import { useAuth } from "../context/AuthContext";
import { deleteContent, listContent, uploadContent } from "../services/api";
import type { ContentItem, ContentType, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "TopicContent">;
type Tab = "VIDEO" | "PDF";

export default function TopicContentScreen({ navigation, route }: Props) {
  const { user, handleAuthError } = useAuth();
  const canEdit = user?.role === "TEACHER" || user?.role === "SCHOOL_ADMIN";
  const [tab, setTab] = useState<Tab>("VIDEO");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listContent(route.params.topicId, tab));
    } catch (e: any) {
      handleAuthError(e);
      setError(e?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, route.params.topicId, tab]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onUpload = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Enter a title before uploading.");
      return;
    }
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: tab === "PDF" ? ["application/pdf"] : ["video/*"],
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]) return;
      const asset = picked.assets[0];
      setUploading(true);
      await uploadContent({
        title: title.trim(),
        type: tab as ContentType,
        topicId: route.params.topicId,
        uri: asset.uri,
        fileName: asset.name || `file-${Date.now()}`,
        mimeType: asset.mimeType || undefined,
      });
      setTitle("");
      await load();
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message || "Could not upload");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = (item: ContentItem) => {
    Alert.alert("Delete", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteContent(item.id);
            await load();
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Delete failed");
          }
        },
      },
    ]);
  };

  return (
    <Screen
      title={route.params.topicName}
      onBack={() => navigation.goBack()}
      loading={loading}
      error={error}
    >
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "VIDEO" && styles.tabActive]}
          onPress={() => setTab("VIDEO")}
        >
          <Text style={[styles.tabText, tab === "VIDEO" && styles.tabTextActive]}>
            Animations
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "PDF" && styles.tabActive]}
          onPress={() => setTab("PDF")}
        >
          <Text style={[styles.tabText, tab === "PDF" && styles.tabTextActive]}>PDFs</Text>
        </Pressable>
      </View>

      {canEdit ? (
        <View style={styles.uploadBox}>
          <TextInput
            style={styles.input}
            placeholder={`Title for new ${tab === "VIDEO" ? "animation" : "PDF"}`}
            placeholderTextColor="#64748b"
            value={title}
            onChangeText={setTitle}
          />
          <Pressable style={styles.uploadBtn} onPress={onUpload} disabled={uploading}>
            <Text style={styles.uploadText}>
              {uploading ? "Uploading..." : `Upload ${tab === "VIDEO" ? "animation" : "PDF"}`}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No {tab === "VIDEO" ? "animations" : "PDFs"} in this topic yet.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: 4 }}>
            <ListCard
              title={item.title}
              subtitle={item.description || (tab === "VIDEO" ? "Animation" : "PDF")}
              right="View"
              onPress={() =>
                navigation.navigate("ContentViewer", {
                  contentId: item.id,
                  title: item.title,
                  type: item.type,
                })
              }
            />
            {canEdit ? (
              <Pressable onPress={() => onDelete(item)}>
                <Text style={styles.deleteLink}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#0ea5e9" },
  tabText: { color: "#94a3b8", fontWeight: "700" },
  tabTextActive: { color: "#0f172a" },
  uploadBox: { paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  input: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    borderRadius: 10,
    padding: 12,
  },
  uploadBtn: {
    backgroundColor: "#38bdf8",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  uploadText: { color: "#0f172a", fontWeight: "800" },
  empty: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
  deleteLink: { color: "#f87171", marginBottom: 8, fontSize: 13 },
});
