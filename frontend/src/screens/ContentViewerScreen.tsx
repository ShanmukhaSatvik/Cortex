import React, { createElement, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { WebView } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { fetchPdfBase64, getToken, mediaUrl } from "../services/api";
import type { RootStackParamList } from "../types";
import {
  displayContentTitle,
  isHttpUrl,
  isYouTubeUrl,
  toYouTubeEmbedUrl,
} from "../utils/youtube";

type Props = NativeStackScreenProps<RootStackParamList, "ContentViewer">;

const isWeb = Platform.OS === "web";

function WebIFrame({
  src,
  title,
  onLoad,
}: {
  src: string;
  title: string;
  onLoad?: () => void;
}) {
  return createElement("iframe", {
    src,
    title,
    onLoad,
    style: {
      border: "none",
      width: "100%",
      height: "100%",
      backgroundColor: "#0f172a",
    },
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
    allowFullScreen: true,
  });
}

function AnimationPlayer({ uri }: { uri: string }) {
  const source = useMemo(() => ({ uri }), [uri]);

  const player = useVideoPlayer(source, (instance) => {
    instance.loop = false;
    instance.play();
  });

  return (
    <VideoView
      style={styles.video}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      nativeControls
      contentFit="contain"
    />
  );
}

function YouTubePlayer({ embedUrl }: { embedUrl: string }) {
  const [ready, setReady] = useState(false);

  return (
    <View style={styles.video}>
      {isWeb ? (
        <WebIFrame
          src={embedUrl}
          title="YouTube video"
          onLoad={() => setReady(true)}
        />
      ) : (
        <WebView
          style={styles.video}
          source={{ uri: embedUrl }}
          originWhitelist={["*"]}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          setSupportMultipleWindows={false}
          userAgent={
            Platform.OS === "android"
              ? "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
              : undefined
          }
          onLoadEnd={() => setReady(true)}
          onError={() => setReady(true)}
        />
      )}
      {!ready ? (
        <View style={styles.overlay}>
          <ActivityIndicator color="#38bdf8" size="large" />
        </View>
      ) : null}
    </View>
  );
}

const PDF_BOOTSTRAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=3" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    html, body { margin: 0; padding: 0; background: #0f172a; }
    #status { display: none; color: #fca5a5; font-family: sans-serif; padding: 24px 16px; text-align: center; }
    #pages { padding: 8px; }
    canvas { display: block; width: 100%; margin: 0 auto 12px; background: #fff; }
  </style>
</head>
<body>
  <div id="status"></div>
  <div id="pages"></div>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    function b64ToUint8(b64data) {
      var raw = atob(b64data);
      var arr = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
      return arr;
    }

    window.renderPdf = function (b64) {
      var statusEl = document.getElementById("status");
      var pagesEl = document.getElementById("pages");
      statusEl.style.display = "none";
      pagesEl.innerHTML = "";

      pdfjsLib.getDocument({ data: b64ToUint8(b64) }).promise.then(function (pdf) {
        var scale = 1.15;
        function drawPage(pageNum) {
          return pdf.getPage(pageNum).then(function (page) {
            var viewport = page.getViewport({ scale: scale });
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            pagesEl.appendChild(canvas);
            return page.render({ canvasContext: ctx, viewport: viewport }).promise;
          });
        }
        return drawPage(1).then(function () {
          var chain = Promise.resolve();
          for (var n = 2; n <= pdf.numPages; n++) {
            (function (pageNum) {
              chain = chain.then(function () { return drawPage(pageNum); });
            })(n);
          }
          return chain;
        });
      }).catch(function (err) {
        statusEl.style.display = "block";
        statusEl.textContent = "Could not open PDF: " + (err && err.message ? err.message : "unknown error");
      });
    };

    window.ReactNativeWebView && window.ReactNativeWebView.postMessage("pdfjs-ready");
  </script>
</body>
</html>`;

export default function ContentViewerScreen({ navigation, route }: Props) {
  const { handleAuthError } = useAuth();
  const webRef = useRef<WebView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [youtubeEmbed, setYoutubeEmbed] = useState<string | null>(null);
  const [pdfJsReady, setPdfJsReady] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setUri(null);
    setYoutubeEmbed(null);
    setPdfBase64(null);
    setPdfJsReady(false);

    (async () => {
      try {
        const token = await getToken();
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

        if (route.params.type === "VIDEO") {
          let external = route.params.externalUrl ?? null;

          const metaRes = await fetch(`${mediaUrl(route.params.contentId)}?meta=1`, {
            headers: authHeaders,
          });
          if (metaRes.ok) {
            const data = (await metaRes.json()) as { externalUrl?: string | null };
            if (isHttpUrl(data.externalUrl)) external = data.externalUrl;
          }

          // Rare: teacher pasted a YouTube link as external content
          if (isYouTubeUrl(external)) {
            const embed = toYouTubeEmbedUrl(external!);
            if (!embed) throw new Error("Could not open this animation.");
            if (!cancelled) {
              setYoutubeEmbed(embed);
              setLoading(false);
            }
            return;
          }

          if (isHttpUrl(external)) {
            if (!cancelled) {
              setUri(external);
              setLoading(false);
            }
            return;
          }

          // Local MP4 — pass JWT in query (Android player drops Authorization headers)
          if (!token) throw new Error("Access token missing.");
          if (!cancelled) {
            setUri(mediaUrl(route.params.contentId, token));
            setLoading(false);
          }
          return;
        }

        // Web: stream PDF via authenticated media URL in an iframe (no WebView)
        if (isWeb) {
          if (!token) throw new Error("Access token missing.");
          if (!cancelled) {
            setUri(mediaUrl(route.params.contentId, token));
            setLoading(false);
          }
          return;
        }

        const base64 = await fetchPdfBase64(route.params.contentId);
        if (!cancelled) {
          setPdfBase64(base64);
          setLoading(false);
        }
      } catch (e: any) {
        handleAuthError(e);
        if (!cancelled) {
          setError(e?.message || "Failed to load content");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    handleAuthError,
    route.params.contentId,
    route.params.externalUrl,
    route.params.type,
  ]);

  useEffect(() => {
    if (!pdfJsReady || !pdfBase64 || route.params.type !== "PDF") return;
    const payload = JSON.stringify(pdfBase64);
    webRef.current?.injectJavaScript(
      `window.renderPdf(${payload}); true;`
    );
  }, [pdfJsReady, pdfBase64, route.params.type]);

  const isPdf = route.params.type === "PDF";
  const screenTitle = displayContentTitle(route.params.title);

  return (
    <Screen
      title={screenTitle}
      onBack={() => navigation.goBack()}
      error={error}
    >
      {youtubeEmbed ? <YouTubePlayer embedUrl={youtubeEmbed} /> : null}

      {uri && route.params.type === "VIDEO" && !youtubeEmbed ? (
        <AnimationPlayer uri={uri} />
      ) : null}

      {isPdf && !error && isWeb && uri ? (
        <View style={styles.pdfWrap}>
          <WebIFrame src={uri} title={screenTitle} />
          {loading ? (
            <View style={styles.overlay}>
              <ActivityIndicator color="#38bdf8" size="large" />
            </View>
          ) : null}
        </View>
      ) : null}

      {isPdf && !error && !isWeb ? (
        <View style={styles.pdfWrap}>
          <WebView
            ref={webRef}
            style={styles.pdf}
            originWhitelist={["*"]}
            source={{ html: PDF_BOOTSTRAP_HTML }}
            javaScriptEnabled
            allowFileAccess
            mixedContentMode="always"
            setSupportMultipleWindows={false}
            onMessage={(event) => {
              if (event.nativeEvent.data === "pdfjs-ready") {
                setPdfJsReady(true);
              }
            }}
          />
          {loading || !pdfBase64 ? (
            <View style={styles.overlay}>
              <ActivityIndicator color="#38bdf8" size="large" />
            </View>
          ) : null}
        </View>
      ) : null}

      {!isPdf && loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#38bdf8" size="large" />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  video: { flex: 1, backgroundColor: "#000" },
  pdfWrap: { flex: 1 },
  pdf: { flex: 1, backgroundColor: "#0f172a" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
