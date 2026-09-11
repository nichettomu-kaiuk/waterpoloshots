import Link from "next/link";
import Image from "next/image";
import { getSettings, getLiveMatches, getUpcomingMatches, getRecentResults, getNewsPosts, getStandings, getTopScorers } from "@/lib/queries";
import MatchCard from "@/components/MatchCard";
import Hero from "@/components/Hero";
import NewsCard from "@/components/NewsCard";
import LaneRope from "@/components/LaneRope";
import LiveBanner from "@/components/LiveBanner";
import SponsorStrip from "@/components/SponsorStrip";

export default async function HomePage() {
  const [settings, live, upcoming, recent, news, standings, scorers] = await Promise.all([
    getSettings(),
    getLiveMatches(),
    getUpcomingMatches(4),
    getRecentResults(4),
    getNewsPosts(3),
    getStandings(),
    getTopScorers(5),
  ]);

  const topScorers = scorers.filter((p) => p.goals_count > 0).slice(0, 4);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero settings={settings} live={live} />

      {/* Live band: the matchday headline from the mockups. Renders only
          while at least one match is live. */}
      {live.map((m) => (
        <LiveBanner key={m.id} match={m} />
      ))}

      <div
        className="relative"
        style={
          settings?.header_bg_url
            ? {
                backgroundImage: `url(${settings.header_bg_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {settings?.header_bg_url && <div className="absolute inset-0 bg-ink/88" />}

        <div className="relative lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-6">
          {/* ── Colonna principale ── */}
          <div>
            <section className="px-5 py-4 lg:px-0 lg:pt-0">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                  Ultimi risultati
                </h2>
                <Link href="/calendario" className="text-xs text-primary">Calendario completo</Link>
              </div>
              {recent.length === 0 ? (
                <p className="text-sm text-muted">Nessun risultato disponibile.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {recent.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              )}
            </section>

            {upcoming.length > 0 && (
              <section className="px-5 py-4 lg:px-0">
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                    Prossimi match
                  </h2>
                  <Link href="/calendario" className="text-xs text-primary">Vedi tutti</Link>
                </div>
                <div className="grouped-card animate-rise divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                  {upcoming.map((m) => (
                    <MatchCard key={m.id} match={m} bare />
                  ))}
                </div>
              </section>
            )}

            {/* Spazio sponsor: si nasconde da solo quando l'elenco in
                components/SponsorStrip.tsx è vuoto. */}
            <div className="px-5 lg:px-0"><SponsorStrip /></div>

            {news.length > 0 && (
              <section className="px-5 py-4 lg:px-0">
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                    News
                  </h2>
                  <Link href="/news" className="text-xs text-primary">Archivio News</Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {news.map((post) => (
                    <NewsCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Colonna laterale: classifica breve + marcatori ── */}
          <aside className="px-5 pb-6 lg:px-0 lg:pb-0">
            <div className="px-0 lg:hidden"><LaneRope /></div>

            {standings.length > 0 && (
              <section className="site-card mb-4 rounded-2xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                    Classifica
                  </h2>
                  <Link href="/classifiche" className="text-xs text-primary">Completa</Link>
                </div>
                <ul className="space-y-1">
                  {standings.slice(0, 5).map((row, i) => (
                    <li key={row.team.id} className="rank-box flex items-center gap-2.5 py-1.5">
                      <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md bg-surface-raised text-[11px] font-semibold">
                        {i + 1}
                      </span>
                      {row.team.logo_url ? (
                        <span className="cap-badge relative inline-block h-[22px] w-[22px] shrink-0">
                          <Image
                            src={row.team.logo_url}
                            alt={row.team.name}
                            width={22}
                            height={22}
                            className="h-[22px] w-[22px] rounded-full border border-line object-cover"
                          />
                        </span>
                      ) : (
                        <span className="cap-badge relative inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-line bg-surface-raised text-[9px] font-display text-muted">
                          {row.team.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <Link href={`/squadra/${row.team.id}`} className="truncate text-sm">
                        {row.team.name}
                      </Link>
                      <span className="ml-auto tabular font-display text-sm font-bold">{row.points}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {topScorers.length > 0 && (
              <section className="site-card rounded-2xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                    Marcatori
                  </h2>
                  <Link href="/classifiche#marcatori" className="text-xs text-primary">Tutti</Link>
                </div>
                <ul className="space-y-1">
                  {topScorers.map((p, i) => (
                    <li key={p.id} className="flex items-baseline gap-2.5 py-1.5 text-sm">
                      <span className="w-3 text-[11px] text-muted">{i + 1}</span>
                      <Link href={`/giocatore/${p.id}`} className="truncate">
                        {p.first_name[0]}. {p.last_name}
                      </Link>
                      <span className="ml-auto tabular font-display font-bold text-gold">{p.goals_count}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
