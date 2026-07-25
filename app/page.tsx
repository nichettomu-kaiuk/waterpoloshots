import Link from "next/link";
import { CalendarDays, Trophy, ListOrdered, Newspaper, Users, UserRound } from "lucide-react";
import { getSettings, getLiveMatches, getUpcomingMatches, getRecentResults, getNewsPosts } from "@/lib/queries";
import MatchCard from "@/components/MatchCard";
import Hero from "@/components/Hero";
import NewsCard from "@/components/NewsCard";

// Set to true to bring back the quick-nav bento-grid (Calendario, Classifica,
// Marcatori, Squadre, Giocatori, News) below the hero. Kept in the code and
// simply toggled off rather than removed, so it's a one-line change to
// restore it.
const SHOW_QUICK_NAV = false;

export default async function HomePage() {
  const [settings, live, upcoming, recent, news] = await Promise.all([
    getSettings(),
    getLiveMatches(),
    getUpcomingMatches(4),
    getRecentResults(4),
    getNewsPosts(2),
  ]);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero settings={settings} live={live} />

      {/* Body of the home page — background configurable in Admin → Branding → "Bg home" */}
      <div
        className="relative"
        style={
          settings?.header_bg_url
            ? {
                backgroundImage: `url(${settings.header_bg_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
              }
            : undefined
        }
      >
        {settings?.header_bg_url && <div className="absolute inset-0 bg-ink/88" />}
        <div className="relative">
          {SHOW_QUICK_NAV && (
            <section className="grid grid-cols-6 gap-1 px-3 py-4">
              <Link
                href="/calendario"
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <CalendarDays size={16} className="text-primary" />
                <span className="text-[8px] font-medium leading-tight">Calendario</span>
              </Link>
              <Link
                href="/classifiche"
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <Trophy size={16} className="text-gold" />
                <span className="text-[8px] font-medium leading-tight">Classifica</span>
              </Link>
              <Link
                href="/marcatori"
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <ListOrdered size={16} className="text-gold" />
                <span className="text-[8px] font-medium leading-tight">Marcatori</span>
              </Link>
              <Link
                href="/squadre"
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <Users size={16} className="text-primary" />
                <span className="text-[8px] font-medium leading-tight">Squadre</span>
              </Link>
              <Link
                href="/giocatori"
                className="mx-auto flex w-full max-w-[46px] flex-col items-center gap-0.5 rounded-lg border border-line bg-surface py-2 text-center transition active:scale-95"
              >
                <UserRound size={16} className="text-primary" />
                <span className="text-[8px] font-medium leading-tight">Giocatori</span>
              </Link>
              <Link
                href="/news"
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
                <Link href="/news" className="text-xs text-primary">Archivio News</Link>
              </div>
              <div className="flex flex-col gap-3">
                {news.map((post) => (
                  <NewsCard key={post.id} post={post} variant="horizontal" />
                ))}
              </div>
            </section>
          )}

          {live.length > 0 && (
            <section className="px-5 pb-2">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted">
                In corso
              </h2>
              <div className="space-y-3">
                {live.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section className="px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                  Prossimi match
                </h2>
                <Link href="/calendario" className="text-xs text-primary">Vedi tutti</Link>
              </div>
              <div className="space-y-3">
                {upcoming.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}

          <section className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                Ultimi risultati
              </h2>
              <Link href="/calendario" className="text-xs text-primary">Vedi tutti</Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-muted">Nessun risultato disponibile.</p>
            ) : (
              <div className="space-y-3">
                {recent.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
