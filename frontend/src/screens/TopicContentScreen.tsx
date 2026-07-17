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
import ImageNavCard from "../components/ImageNavCard";
import { useAuth } from "../context/AuthContext";
import { deleteContent, listContent, uploadContent } from "../services/api";
import { cardAccent, useTheme } from "../theme";
import type { ContentItem, ContentType, RootStackParamList } from "../types";
import { displayContentTitle } from "../utils/youtube";

const videoArt = require("../../assets/illustrations/content-video.png");
const pdfArt = require("../../assets/illustrations/content-pdf.png");

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
  const theme = useTheme();
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
      <View style={styles.tabsPad}>
        <SegmentedTabs
          items={[
            { key: "VIDEO", label: "Animations" },
            { key: "PDF", label: "PDFs" },
          ]}
          value={tab}
          onChange={onTabChange}
        />
      </View>

      {canEdit ? (
        <View
          style={[
            styles.uploadBox,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
                fontFamily: theme.fonts.body,
              },
            ]}
            placeholder="Title"
            placeholderTextColor={theme.colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <Pressable
            style={[
              styles.uploadBtn,
              { backgroundColor: theme.colors.accent },
            ]}
            onPress={onUpload}
            disabled={uploading}
          >
            <Text
              style={[
                styles.uploadText,
                {
                  color: theme.colors.textOnAccent,
                  fontFamily: theme.fonts.bodyBold,
                },
              ]}
            >
              {uploading ? "…" : "Upload"}
            </Text>
          </Pressable>
        </View>
      ) : null}

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
      ) : null}

      {loading || refreshing ? (
        <View style={styles.listLoader}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text
              style={[
                styles.empty,
                {
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.body,
                },
              ]}
            >
              No {tab === "VIDEO" ? "animations" : "PDFs"} yet.
            </Text>
          }
          renderItem={({ item, index }) => (
            <ImageNavCard
              title={displayContentTitle(item.title)}
              subtitle={tab === "VIDEO" ? "Animation" : "PDF lesson"}
              image={tab === "VIDEO" ? videoArt : pdfArt}
              accent={cardAccent(theme, index)}
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
  tabsPad: { paddingHorizontal: 16, paddingTop: 12 },
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  uploadBtn: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  uploadText: {},
  list: { padding: 16, paddingBottom: 32 },
  listLoader: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", marginTop: 40 },
  error: { paddingHorizontal: 16, paddingTop: 8 },
});


