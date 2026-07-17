import React, { createContext, useContext, useMemo } from "react";
import { cortexKidsTheme } from "./flavors/cortexKids";
import type { ThemeTokens } from "./types";

const ThemeContext = createContext<ThemeTokens>(cortexKidsTheme);

type Props = {
  /** Flavor id — only `cortex-kids` for now; expand when clients pick colors. */
  flavorId?: string;
  children: React.ReactNode;
};

const FLAVORS: Record<string, ThemeTokens> = {
  "cortex-kids": cortexKidsTheme,
};

export function ThemeProvider({ flavorId = "cortex-kids", children }: Props) {
  const theme = useMemo(
    () => FLAVORS[flavorId] ?? cortexKidsTheme,
    [flavorId]
  );
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}
