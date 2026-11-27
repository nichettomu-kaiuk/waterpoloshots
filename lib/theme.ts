import type { Settings } from "@/lib/supabase/types";

// Brand colours (CSS variables set on <body>) for a tournament.
export function brandVarsFor(settings: Settings | null | undefined): React.CSSProperties {
  return {
    ["--color-primary" as any]: settings?.primary_color ?? "#e10f21",
    ["--color-primary-dim" as any]: settings?.primary_color ? `${settings.primary_color}b0` : "#8c0a16",
    ["--color-gold" as any]: settings?.secondary_color ?? "#d4af37",
  };
}

// Theme is stored as a single value (e.g. "lane-light") but applied as two
// composable classes: the structural shape (theme-lane / theme-regulation /
// none for classic) and, if it's a light variant, `theme-light` — which just
// swaps the background/text color tokens and leaves every shape rule
// (clip-paths, borders, etc.) untouched.
export function themeClassFor(settings: Settings | null | undefined): string {
  const theme = settings?.theme ?? "classic";
  const isLight = theme.endsWith("-light");
  const baseTheme = isLight ? theme.replace("-light", "") : theme;
  const structuralClass = baseTheme === "lane" ? "theme-lane" : baseTheme === "regulation" ? "theme-regulation" : "";
  return [structuralClass, isLight ? "theme-light" : ""].filter(Boolean).join(" ");
}
