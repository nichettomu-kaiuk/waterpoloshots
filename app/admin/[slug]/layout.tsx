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
// Also builds the same Hero used everywhere else on the site — identical on
// every admin page for this championship (Dashboard, Impostazioni, News,
// Squadre, Giocatori, Partite, Piscine all get the exact same one, title/
// subtitle/active round included) — Hero is an async Server Component, so
// it has to be rendered here rather than inside AdminChampionshipShell
// itself ("use client"), same reasoning as app/admin/login/page.tsx.
//
// themeClass/brandVars (colori e classe strutturale del tema scelto per
// QUESTO campionato) sono passati a AdminChampionshipShell, che li applica a
// un unico wrapper attorno a tutta la sezione admin del campionato (header,
// pagine, barra di navigazione inferiore) — non più solo attorno a Hero come
// in precedenza — così l'intera sezione Admin segue il tema, non solo Hero.
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

  const hero = <Hero championshipId={championship.id} settings={settings} live={live} />;

  return (
    <AdminChampionshipShell championship={championship} hero={hero} themeClass={themeClass} brandVars={brandVars}>
      {children}
    </AdminChampionshipShell>
  );
}
