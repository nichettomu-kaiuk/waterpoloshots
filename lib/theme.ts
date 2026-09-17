import type { CSSProperties } from "react";
import type { Settings } from "./supabase/types";

// Turns a championship's `settings` row into the CSS custom properties +
// theme class that globals.css expects. Shared by app/[slug]/layout.tsx
// (applies it to the whole championship site) and app/(site)/page.tsx (the
// selector page, when it previews one championship's Hero with its own
// branding instead of the neutral selector look).
export function getThemeVars(settings: Settings | null): {
  brandVars: CSSProperties;
  themeClass: string;
} {
  const brandVars: CSSProperties = {
    ["--color-primary" as any]: settings?.primary_color ?? "#e10f21",
    ["--color-primary-dim" as any]: settings?.primary_color
      ? `${settings.primary_color}b0`
      : "#8c0a16",
    ["--color-gold" as any]: settings?.secondary_color ?? "#d4af37",
  };

  // Theme is stored as a single value (e.g. "lane-light") but applied as two
  // composable classes: the structural shape (theme-lane / theme-regulation
  // / theme-impact / theme-broadcast / theme-poster / theme-tabellone /
  // theme-magazine / none for classic) and, if it's a light variant,
  // `theme-light` — which just swaps the background/text color tokens and
  // leaves every shape rule (clip-paths, borders, etc.) untouched.
  const theme = settings?.theme ?? "classic";
  const isLight = theme.endsWith("-light");
  const baseTheme = isLight ? theme.replace("-light", "") : theme;
  const structuralClassMap: Record<string, string> = {
    lane: "theme-lane",
    regulation: "theme-regulation",
    impact: "theme-impact",
    broadcast: "theme-broadcast",
    poster: "theme-poster",
    tabellone: "theme-tabellone",
    magazine: "theme-magazine",
  };
  const structuralClass = structuralClassMap[baseTheme] ?? "";
  const themeClass = [structuralClass, isLight ? "theme-light" : ""].filter(Boolean).join(" ");

  return { brandVars, themeClass };
}
