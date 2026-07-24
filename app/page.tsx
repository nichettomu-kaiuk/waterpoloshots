import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Trophy, ListOrdered, Newspaper, Users, UserRound } from "lucide-react";
import { getSettings, getLiveMatches, getUpcomingMatches, getRecentResults, getNewsPosts } from "@/lib/queries";
import MatchCard from "@/components/MatchCard";
import LiveBadge from "@/components/LiveBadge";
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
      <section className="relative overflow-hidden water-texture px-5 pb-12 pt-10">
        {settings?.home_bg_url && (
          <>
            {/* Background image with soft faded edges — a radial mask fades
                the photo to transparent toward every side so it blends into
                the page instead of ending in a hard rectangle. */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${settings.home_bg_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitMaskImage:
                  "radial-gradient(ellipse 75% 70% at 50% 32%, black 20%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 75% 70% at 50% 32%, black 20%, transparent 100%)",
              }}
            />
            <div className="absolute inset-0 bg-ink/45" />
            {/* Extra fade concentrated on the bottom edge, so the hero melts
                into the body of the page rather than the vignette above
                doing all the work uniformly. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
          </>
        )}
        <div className="relative">
          {live.length > 0 && (
            <div className="mb-3">
              <LiveBadge />
            </div>
          )}
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            {settings?.active_round ?? "Girone di andata"}
          </p>
          <div className="mt-1 flex items-center gap-3">
            {settings?.logo_url && (
              <Image
                src={settings.logo_url}
                alt={settings.tournament_title ?? "Logo torneo"}
                width={60}
                height={60}
                className="h-[60px] w-[60px] shrink-0 self-center rounded-full border border-gold/50 object-cover"
              />
            )}
            <div>
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
                {settings?.tournament_title ?? "Torneo di Pallanuoto"}
              </h1>
              {settings?.tournament_subtitle && (
                <p className="mt-1 text-sm text-muted">{settings.tournament_subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </section>

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
