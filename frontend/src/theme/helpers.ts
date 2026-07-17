import type { ThemeTokens } from "./types";

/** Pick a rotating accent for list cards (subjects, grades, topics). */
export function cardAccent(theme: ThemeTokens, index: number): string {
  const palette = theme.colors.palette;
  return palette[index % palette.length]!;
}
