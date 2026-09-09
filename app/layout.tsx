import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import TopRightControls from "@/components/TopRightControls";
import { getSettings } from "@/lib/queries";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// Dynamic so the browser tab title and favicon follow whatever is set in
// Admin → Impostazioni (tournament title + logo), falling back to
// "Serie B - Girone 3" and no custom icon when nothing is configured yet.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings?.tournament_title || "Serie B - Girone 3";

  return {
    title,
    description: "Calendario, classifiche e risultati live del torneo.",
    icons: settings?.logo_url ? { icon: settings.logo_url } : undefined,
  };
}

// Scales a #rrggbb color toward black, keeping its hue. Used only for
// --color-gold/--color-gold-dim on light themes: the brand gold (default
// #d4af37, or whatever secondary_color Admin picked) sits at ~2:1 contrast
// on a white/near-white background — far below the 4.5:1 WCAG AA minimum
// for text — and it's used as text color in 30+ places (classifica points,
// gol count, credits icon…). 0.62 keeps ~5:1 for the default gold and
// degrades gracefully for any custom color Admin sets.
function darken(hex: string, factor: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * factor);
  return `#${[r, g, b].map((c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, "0")).join("")}`;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  // Theme is stored as a single value (e.g. "lane-light") but applied as two
  // composable classes: the structural shape (theme-lane / theme-regulation
  // / none for classic) and, if it's a light variant, `theme-light` — which
  // just swaps the background/text color tokens and leaves every shape rule
  // (clip-paths, borders, etc.) untouched.
  const theme = settings?.theme ?? "classic";
  const isLight = theme.endsWith("-light");
  const baseTheme = isLight ? theme.replace("-light", "") : theme;
  const structuralClass = baseTheme === "lane" ? "theme-lane" : baseTheme === "regulation" ? "theme-regulation" : "";
  const themeClass = [structuralClass, isLight ? "theme-light" : ""].filter(Boolean).join(" ");

  const gold = settings?.secondary_color ?? "#d4af37";

  const brandVars: React.CSSProperties = {
    ["--color-primary" as any]: settings?.primary_color ?? "#e10f21",
    ["--color-primary-dim" as any]: settings?.primary_color
      ? `${settings.primary_color}b0`
      : "#8c0a16",
    // Set directly on <body>, so this always wins over the .theme-light
    // class rule on <html> for anything nested inside body (i.e. the whole
    // page) — darken it here instead, or the light-theme contrast fix never
    // actually applies at runtime.
    ["--color-gold" as any]: isLight ? darken(gold, 0.62) : gold,
    ["--color-gold-dim" as any]: isLight ? darken(gold, 0.48) : undefined,
  };

  return (
    <html
      lang="it"
      className={`${display.variable} ${body.variable} ${mono.variable} ${themeClass}`}
    >
      <body className="font-body min-h-screen antialiased" style={brandVars}>
        <TopNav settings={settings} />
        <div className="flex min-h-screen flex-col pb-24 lg:pb-0">
          <div className="flex-1">{children}</div>
          <Footer settings={settings} />
        </div>
        <TopRightControls settings={settings} />
        <BottomNav />
      </body>
    </html>
  );
}
