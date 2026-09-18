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
// Also builds the same Hero used everywhere else on the site (public pages,
// the selector home, the login page) and passes it down as a prop — Hero is
// an async Server Component, so it has to be rendered here rather than
// inside AdminChampionshipShell itself ("use client"), same reasoning as
// app/admin/login/page.tsx. Title/subtitle/active round stay off: the shell
// already shows the championship's name as its own heading right below.
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

  return (
    <AdminChampionshipShell championship={championship} hero={hero}>
      {children}
    </AdminChampionshipShell>
  );
}
