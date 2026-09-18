import { getChampionships, getSettings, getLiveMatches } from "@/lib/queries";
import { getThemeVars } from "@/lib/theme";
import Hero from "@/components/Hero";
import AdminChampionshipsList from "@/components/admin/AdminChampionshipsList";

// Server Component wrapper (same reasoning as app/admin/login/page.tsx): the
// "Campionati" list doesn't belong to one specific championship, so — like
// the login page — it shows the first one's (oldest) branding as its Hero,
// title/subtitle/active round off (only Settings shows those, since that's
// the one page actively editing them).
//
// The container is now "max-w-md lg:max-w-5xl xl:max-w-6xl", matching
// AdminChampionshipShell and the login page: this page used to be its own
// narrower "max-w-3xl" with no Hero at all, which is what made the admin
// header look inconsistent depending on which admin page you were on.
export default async function AdminPage() {
  const championships = await getChampionships();
  const featured = championships[0] ?? null;
  const [featuredSettings, featuredLive] = featured
    ? await Promise.all([getSettings(featured.id), getLiveMatches(featured.id)])
    : [null, []];

  const { brandVars, themeClass } = getThemeVars(featuredSettings);

  return (
    <div className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      {featured && (
        <div className={themeClass} style={brandVars}>
          <Hero
            championshipId={featured.id}
            settings={featuredSettings}
            live={featuredLive}
            showTitle={false}
            showSubtitle={false}
            showActiveRound={false}
          />
        </div>
      )}

      <div className="px-5 pt-5 lg:px-8">
        <AdminChampionshipsList />
      </div>
    </div>
  );
}
