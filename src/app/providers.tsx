'use client';

import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("chronos-theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.setProperty("--background", theme === "dark" ? "#0b1120" : "#f5f7ff");
    root.style.setProperty("--foreground", theme === "dark" ? "#e5e7eb" : "#0f172a");
    window.localStorage.setItem("chronos-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
        <HeroUIProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}