/**
 * Theme tokens for Cortex UI.
 * Future client "flavors" = alternate ThemeTokens with the same shape.
 */
export type ThemeTokens = {
  id: string;
  name: string;
  colors: {
    bgTop: string;
    bgBottom: string;
    surface: string;
    surfaceMuted: string;
    text: string;
    textMuted: string;
    textOnAccent: string;
    border: string;
    primary: string;
    primarySoft: string;
    accent: string;
    accentSoft: string;
    sun: string;
    sunSoft: string;
    danger: string;
    dangerSoft: string;
    /** Rotating card accents for lists (subjects, grades, etc.) */
    palette: string[];
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  space: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fonts: {
    display: string;
    body: string;
    bodyBold: string;
  };
  shadow: {
    color: string;
    offset: { width: number; height: number };
    opacity: number;
    radius: number;
  };
};
