import Link from "next/link";
import { CalendarDays, Trophy, Newspaper, Users, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { optimizedImageUrl } from "@/lib/image-url";
import { getTournamentBySlug, getLiveMatches, getUpcomingMatches, getRecentResults, getNewsPosts } from "@/lib/queries";
import MatchCard from "@/components/MatchCard";
import Hero from "@/components/Hero";
import NewsCard from "@/components/NewsCard";
import LaneRope from "@/components/LaneRope";

// Set to true to bring back the quick-nav bento-grid (Calendario, Classifica,
// Marcatori, Squadre, Giocatori, News) below the hero. Kept in the code and
// simply toggled off rather than removed, so it's a one-line change to
// restore it.
const SHOW_QUICK_NAV = false;

export default async function HomePage({ params }: { params: { tournament: string } }) {
  const tournament = await getTournamentBySlug(params.tournament);
  if (!tournament) notFound();
  const base = `/${tournament.slug}`;

  const [live, upcoming, recent, news] = await Promise.all([
    getLiveMatches(tournament.id),
    getUpcomingMatches(tournament.id, 5),
    getRecentResults(tournament.id, 5),
    getNewsPosts(tournament.id, 2),
  ]);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero tournament={tournament} live={live} />

      {/* Body of the home page — background configurable in Admin → Branding → "Bg home".
          No background-attachment: fixed here — it's unreliable on mobile
          browsers (iOS Safari in particular), where it can stop the image
          from resizing to the element's actual width. */}
      <div
        className="relative"
        style={
          tournament.header_bg_url
            ? {
                backgroundImage: `url(${optimizedImageUrl(tournament.header_bg_url, 1080, 50)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {tournament.header_bg_url && <div className="absolute inset-0 bg-ink/88" />}
        <div className="relative">
          {SHOW_QUICK_NAV && (
            <section className="grid grid-cols-5 gap-1 px-3 py-4">
              <Link
                href={`${base}/calendario`}
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <CalendarDays size={16} className="text-primary" />
                <span className="text-[8px] font-medium leading-tight">Calendario</span>
              </Link>
              <Link
                href={`${base}/classifiche`}
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <Trophy size={16} className="text-gold" />
                <span className="text-[8px] font-medium leading-tight">Classifiche</span>
              </Link>
              <Link
                href={`${base}/squadre`}
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <Users size={16} className="text-primary" />
                <span className="text-[8px] font-medium leading-tight">Squadre</span>
              </Link>
              <Link
                href={`${base}/giocatori`}
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <UserRound size={16} className="text-primary" />
                <span className="text-[8px] font-medium leading-tight">Giocatori</span>
              </Link>
              <Link
                href={`${base}/news`}
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <Newspaper size={16} className="text-gold" />
                <span className="text-[8px] font-medium leading-tight">News</span>
              </Link>
            </section>
          )}

          {news.length > 0 && (
            <section className="px-5 pb-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                  News
                </h2>
                <Link href={`${base}/news`} className="text-xs text-primary">Archivio News</Link>
              </div>
              <div className="flex flex-col gap-3">
                {news.map((post) => (
                  <NewsCard key={post.id} post={post} slug={tournament.slug} variant="horizontal" />
                ))}
              </div>
            </section>
          )}

          <div className="px-5"><LaneRope /></div>

          {live.length > 0 && (
            <section className="px-5 pb-2">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted">
                In corso
              </h2>
              <div className="space-y-3">
                {live.map((m) => (
                  <MatchCard key={m.id} match={m} stacked />
                ))}
              </div>
            </section>
          )}

          {/* Mobile: stacked (Prossimi match, then Ultimi risultati). Desktop
              (lg+): side by side, Ultimi risultati on the left and Prossimi
              match on the right. */}
          <div className="lg:grid lg:grid-cols-2 lg:items-start">
          {upcoming.length > 0 && (
            <section className="px-5 py-4 lg:order-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                  Prossimi match
                </h2>
                <Link href={`${base}/calendario`} className="text-xs text-primary">Vedi tutti</Link>
              </div>
              <div className="grouped-card animate-rise divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {upcoming.map((m) => (
                  <MatchCard key={m.id} match={m} bare stacked />
                ))}
              </div>
            </section>
          )}

          <div className="px-5 lg:hidden"><LaneRope /></div>

          <section
            className={`px-5 py-4 lg:order-1${upcoming.length === 0 ? " lg:col-span-2" : ""}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                Ultimi risultati
              </h2>
              <Link href={`${base}/calendario`} className="text-xs text-primary">Vedi tutti</Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-muted">Nessun risultato disponibile.</p>
            ) : (
              <div className="grouped-card animate-rise divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {recent.map((m) => (
                  <MatchCard key={m.id} match={m} bare stacked />
                ))}
              </div>
            )}
          </section>
          </div>
        </div>
      </div>
    </main>
  );
}
