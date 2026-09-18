import { getChampionships, getSettings, getLiveMatches } from "@/lib/queries";
import { getThemeVars } from "@/lib/theme";
import Hero from "@/components/Hero";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

// Server Component (unlike the rest of app/admin/**, which is force-dynamic
// but otherwise plain client pages): it needs to fetch a championship's
// branding server-side to render the same Hero used everywhere else — full,
// title/subtitle/active round included, same as every other admin page
// (AdminChampionshipShell) — the same way app/admin/login/page.tsx and
// app/(site)/page.tsx preview it. With 0 or 2+ championships this picks the
// first one (oldest — see getChampionships); with exactly one, it's that
// one.
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
          <Hero championshipId={featured.id} settings={featuredSettings} live={featuredLive} />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center pt-8">
        <AdminLoginForm />
      </div>
    </main>
  );
}
