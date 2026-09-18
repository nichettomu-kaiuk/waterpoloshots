import { getChampionships, getSettings, getLiveMatches } from "@/lib/queries";
import { getThemeVars } from "@/lib/theme";
import Hero from "@/components/Hero";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

// Server Component (unlike the rest of app/admin/**, which is force-dynamic
// but otherwise plain client pages): it needs to fetch a championship's
// branding server-side to render the same Hero used everywhere else — same
// size/background as every other admin page (AdminChampionshipShell). With
// 0 or 2+ championships this picks the first one (oldest — see
// getChampionships); with exactly one, it's that one.
//
// Title and active round stay off here specifically (unlike every other
// admin page, where both show): this is the one admin page not scoped to a
// single championship — the "featured" one shown here is really just a
// stand-in for branding/theme, so naming it and showing "its" matchday
// would be misleading before the admin has even logged in. Subtitle stays
// on, same as everywhere else.
//
// Same "max-w-md lg:max-w-5xl xl:max-w-6xl" container as
// AdminChampionshipShell, so the Hero renders at the same size everywhere
// instead of being capped narrower here.
export default async function AdminLoginPage() {
  const championships = await getChampionships();
  const featured = championships[0] ?? null;
  const [featuredSettings, featuredLive] = featured
    ? await Promise.all([getSettings(featured.id), getLiveMatches(featured.id)])
    : [null, []];

  const { brandVars, themeClass } = getThemeVars(featuredSettings);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col pb-12 lg:max-w-5xl xl:max-w-6xl">
      {featured && (
        <div className={themeClass} style={brandVars}>
          <Hero
            championshipId={featured.id}
            settings={featuredSettings}
            live={featuredLive}
            showTitle={false}
            showActiveRound={false}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center pt-8">
        <AdminLoginForm />
      </div>
    </main>
  );
}
