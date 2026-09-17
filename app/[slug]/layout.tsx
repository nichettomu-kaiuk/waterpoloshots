import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "../globals.css";
import BottomNav from "@/components/BottomNav";
import TopRightControls from "@/components/TopRightControls";
import { getSettings } from "@/lib/queries";
import { getChampionshipOrNotFound } from "@/lib/championship";

// Root layout for every public championship page (app/[slug]/...). This is
// its own Next.js "root layout" (its own <html>/<body>), separate from
// app/(site)/layout.tsx (the selector) and app/admin/layout.tsx — see the
// "multiple root layouts" pattern in Next.js docs. It's what was previously
// the single app/layout.tsx, now resolving the championship from the [slug]
// segment instead of reading one global settings row.
const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
// Display face used only by the "Magazine" theme, which remaps
// --font-display to --font-magazine in globals.css.
const magazine = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-magazine",
});

// Dynamic so the browser tab title and favicon follow whatever is set in
// Admin → Impostazioni (tournament title + logo) for THIS championship,
// falling back to its name when nothing is configured yet.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const championship = await getChampionshipOrNotFound(params.slug);
  const settings = await getSettings(championship.id);
  const title = settings?.tournament_title || championship.name;

  return {
    title,
    description: "Calendario, classifiche e risultati live del torneo.",
    icons: settings?.logo_url ? { icon: settings.logo_url } : undefined,
  };
}

export default async function ChampionshipLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const championship = await getChampionshipOrNotFound(params.slug);
  const settings = await getSettings(championship.id);

  const brandVars: React.CSSProperties = {
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

  return (
    <html
      lang="it"
      className={`${display.variable} ${body.variable} ${mono.variable} ${magazine.variable} ${themeClass}`}
    >
      <body className="font-body min-h-screen antialiased" style={brandVars}>
        <div className="flex min-h-screen flex-col pb-24">{children}</div>
        <TopRightControls settings={settings} slug={params.slug} />
        <BottomNav />
      </body>
    </html>
  );
}
