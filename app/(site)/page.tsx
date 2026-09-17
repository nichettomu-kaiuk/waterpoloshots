import Link from "next/link";
import { redirect } from "next/navigation";
import { Trophy, Lock, ChevronRight } from "lucide-react";
import { getChampionships, getSettings, getLiveMatches } from "@/lib/queries";
import { getThemeVars } from "@/lib/theme";
import Hero from "@/components/Hero";

// First page of the whole site: a visitor picks which championship to
// browse. Every public page after this lives under /[slug]/... — see
// app/[slug]/layout.tsx. Admin → Campionati is what adds/removes the cards
// shown here. With exactly one championship published, this selection step
// is skipped entirely and the visitor lands straight on it.
export default async function ChampionshipSelectorPage() {
  const championships = await getChampionships();

  if (championships.length === 1) {
    redirect(`/${championships[0].slug}`);
  }

  // With 0 or 2+ championships, the selector is shown. When there's more
  // than one, the first in the list (oldest — see getChampionships) gets its
  // hero previewed at the top, with its own branding/theme, but without its
  // title/subtitle/active round: those repeat the campionato's own name,
  // which this page already gives each card below, and would be confusing
  // for whichever championship isn't the one picked.
  const featured = championships[0] ?? null;
  const [featuredSettings, featuredLive] = featured
    ? await Promise.all([getSettings(featured.id), getLiveMatches(featured.id)])
    : [null, []];

  const { brandVars, themeClass } = getThemeVars(featuredSettings);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col pb-12">
      <Link
        href="/admin"
        aria-label="Pannello Admin"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-gold hover:text-gold"
      >
        <Lock size={16} />
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

      <div className="px-5 pt-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Trophy size={26} />
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Scegli il campionato</h1>
          <p className="mt-2 text-sm text-muted">
            Calendario, classifiche, squadre e risultati live — seleziona il torneo che vuoi seguire.
          </p>
        </div>

        {championships.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
            Nessun campionato pubblicato ancora.
          </div>
        ) : (
          <div className="space-y-3">
            {championships.map((c) => (
              <Link
                key={c.id}
                href={`/${c.slug}`}
                className="site-card flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition active:scale-[0.99]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Trophy size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-bold leading-tight">{c.name}</p>
                  {c.subtitle && <p className="truncate text-xs text-muted">{c.subtitle}</p>}
                </div>
                <ChevronRight size={18} className="shrink-0 text-muted" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
