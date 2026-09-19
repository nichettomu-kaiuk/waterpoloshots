import { getChampionships, getSettings, getLiveMatches } from "@/lib/queries";
import { getThemeVars } from "@/lib/theme";
import Hero from "@/components/Hero";
import AdminChampionshipsList from "@/components/admin/AdminChampionshipsList";

// Server Component wrapper (same reasoning as app/admin/login/page.tsx): the
// "Campionati" list doesn't belong to one specific championship, so — like
// the login page — it shows the first one's (oldest) branding as its Hero,
// with title/subtitle/active round blanked (only Settings shows those,
// since that's the one page actively editing them). blankIdentity (not
// showTitle/showSubtitle/showActiveRound = false) keeps those elements in
// the layout with invisible text, so the hero still takes up exactly the
// same height as every other admin page's hero instead of coming out
// shorter.
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
            blankIdentity
          />
        </div>
      )}

      <div className="px-5 pt-5 lg:px-8">
        <AdminChampionshipsList />
      </div>
    </div>
  );
}
