/** Convert a YouTube watch / short / embed URL into an embeddable player URL. */
export function toYouTubeEmbedUrl(raw: string): string | null {
  const id = extractYouTubeId(raw);
  if (!id) return null;
  // playsinline helps Android WebView; modestbranding reduces chrome noise
  return `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&modestbranding=1&fs=1`;
}

export function extractYouTubeId(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtube-nocookie.com")) {
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] || null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] || null;
      }
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

export function isYouTubeUrl(value: string | null | undefined): boolean {
  return Boolean(value && extractYouTubeId(value));
}

export function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  return value.startsWith("http://") || value.startsWith("https://");
}

/** Hide channel / platform branding from titles shown in the app. */
export function displayContentTitle(title: string): string {
  return title
    .replace(
      /\s*\((?:Khan Academy|Crash Course(?: Physics| Chemistry| Literature)?|Math Antics|TED-Ed|English with [^)]+)\)\s*/gi,
      " "
    )
    .replace(/\s*[·|]\s*(?:Free education|Khan Academy|Crash Course|YouTube).*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
