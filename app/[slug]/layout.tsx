import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings, getTournamentBySlug } from "@/lib/queries";
import BottomNav from "@/components/BottomNav";
import TopRightControls from "@/components/TopRightControls";

// Everything tournament-specific lives here: resolving the campionato from
// the URL slug (404 if it doesn't exist or was deleted), branding/theme,
// the bottom nav and the admin/campionati corner shortcuts. The root layout
// (app/layout.tsx) only registers fonts — it also wraps the campionati
// selector at app/page.tsx, which has no tournament to theme itself around.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tournament = await getTournamentBySlug(params.slug);
  if (!tournament) return {};
  const settings = await getSettings(tournament.id);
  const title = settings?.tournament_title || tournament.name;

  return {
    title,
    description: "Calendario, classifiche e risultati live del torneo.",
    icons: settings?.logo_url ? { icon: settings.logo_url } : undefined,
  };
}

export default async function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const tournament = await getTournamentBySlug(params.slug);
  if (!tournament) notFound();

  const settings = await getSettings(tournament.id);

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
  // leaves every shape rule (clip-paths, borders, etc.) untouched. Applied
  // on this wrapper div (rather than <html>, which app/layout.tsx already
  // owns for every campionato) since every themed CSS hook in globals.css
  // targets a `.theme-*` ancestor, not specifically the <html> element.
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
    <div className={`${themeClass} flex min-h-screen flex-col pb-24`} style={brandVars}>
      {children}
      <TopRightControls settings={settings} slug={tournament.slug} />
      <BottomNav slug={tournament.slug} />
    </div>
  );
}
