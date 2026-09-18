import { getChampionshipOrNotFound } from "@/lib/championship";
import { getSettings, getLiveMatches } from "@/lib/queries";
import { getThemeVars } from "@/lib/theme";
import Hero from "@/components/Hero";
import AdminChampionshipShell from "@/components/admin/AdminChampionshipShell";

// Resolves the championship from the URL (server-side, so a mistyped or
// deleted slug 404s immediately) and hands it to the client-side nav shell,
// which also puts it in context for every nested "use client" admin page
// (teams, players, matches, venues, news, settings) via useChampionship().
//
// Also builds the same Hero used everywhere else on the site — Hero is an
// async Server Component, so it has to be rendered here rather than inside
// AdminChampionshipShell itself ("use client"), same reasoning as
// app/admin/login/page.tsx. Two variants, from the same fetched data:
// - `hero`: title/subtitle/active round off, since every other admin page's
//   own heading already repeats the championship's name right below it.
// - `heroFull`: identical to the public site's hero (all three on) — used
//   only on the Settings page, where the admin is actively editing that
//   title/subtitle/logo/backgrounds and wants to see exactly what a visitor
//   would see, not a stripped-down preview.
// AdminChampionshipShell (which has the current pathname) picks between them.
export default async function AdminChampionshipLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const championship = await getChampionshipOrNotFound(params.slug);
  const [settings, live] = await Promise.all([getSettings(championship.id), getLiveMatches(championship.id)]);
  const { brandVars, themeClass } = getThemeVars(settings);

  const hero = (
    <div className={themeClass} style={brandVars}>
      <Hero
        championshipId={championship.id}
        settings={settings}
        live={live}
        showTitle={false}
        showSubtitle={false}
        showActiveRound={false}
      />
    </div>
  );

  const heroFull = (
    <div className={themeClass} style={brandVars}>
      <Hero championshipId={championship.id} settings={settings} live={live} />
    </div>
  );

  return (
    <AdminChampionshipShell championship={championship} hero={hero} heroFull={heroFull}>
      {children}
    </AdminChampionshipShell>
  );
}
