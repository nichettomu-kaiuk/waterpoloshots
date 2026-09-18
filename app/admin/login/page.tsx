import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getChampionships, getSettings, getLiveMatches } from "@/lib/queries";
import { getThemeVars } from "@/lib/theme";
import Hero from "@/components/Hero";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

// Server Component (unlike the rest of app/admin/**, which is force-dynamic
// but otherwise plain client pages): it needs to fetch a championship's
// branding server-side to render the same Hero used everywhere else, the
// same way app/(site)/page.tsx previews it. With 0 or 2+ championships this
// picks the first one (oldest — see getChampionships), same tie-break as the
// selector page; with exactly one, it's that one.
export default async function AdminLoginPage() {
  const championships = await getChampionships();
  const featured = championships[0] ?? null;
  const [featuredSettings, featuredLive] = featured
    ? await Promise.all([getSettings(featured.id), getLiveMatches(featured.id)])
    : [null, []];

  const { brandVars, themeClass } = getThemeVars(featuredSettings);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col pb-12">
      <Link
        href="/"
        className="mb-2 inline-flex items-center gap-1 px-5 pt-4 text-[11px] text-muted hover:text-white"
      >
        <ArrowLeft size={12} /> Torna al sito
      </Link>

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

      <div className="flex flex-1 flex-col justify-center pt-8">
        <AdminLoginForm />
      </div>
    </main>
  );
}
