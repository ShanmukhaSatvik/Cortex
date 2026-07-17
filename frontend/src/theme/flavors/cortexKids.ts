import type { ThemeTokens } from "../types";

/**
 * Default Cortex kids flavor — bright classroom energy.
 * Soft sky → warm cream atmosphere, teal primary, coral CTA.
 * Swap this file (or add siblings) when a client picks brand colors later.
 */
export const cortexKidsTheme: ThemeTokens = {
  id: "cortex-kids",
  name: "Cortex Kids",
  colors: {
    bgTop: "#D9F1FF",
    bgBottom: "#FFF6E8",
    surface: "#FFFFFF",
    surfaceMuted: "#F3F8FC",
    text: "#1B2A3A",
    textMuted: "#5C6B7A",
    textOnAccent: "#FFFFFF",
    border: "#D5E4F0",
    primary: "#0F9B8E",
    primarySoft: "#D5F5F0",
    accent: "#F06A3D",
    accentSoft: "#FFE4D8",
    sun: "#F5B942",
    sunSoft: "#FFF0C8",
    danger: "#E25555",
    dangerSoft: "#FFE0E0",
    palette: ["#F06A3D", "#0F9B8E", "#3B9AE1", "#F5B942", "#E86B9A", "#6B8CFF"],
  },
  radii: {
    sm: 12,
    md: 16,
    lg: 22,
    xl: 28,
  },
  space: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fonts: {
    display: "Fredoka_600SemiBold",
    body: "Nunito_400Regular",
    bodyBold: "Nunito_700Bold",
  },
  shadow: {
    color: "#1B2A3A",
    offset: { width: 0, height: 4 },
    opacity: 0.08,
    radius: 10,
  },
};
