import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Trophy, ListOrdered } from "lucide-react";
import { getSettings, getLiveMatches, getUpcomingMatches, getRecentResults, getNewsPosts } from "@/lib/queries";
import MatchCard from "@/components/MatchCard";
import LiveBadge from "@/components/LiveBadge";
import NewsStrip from "@/components/NewsStrip";

export default async function HomePage() {
  const [settings, live, upcoming, recent, news] = await Promise.all([
    getSettings(),
    getLiveMatches(),
    getUpcomingMatches(4),
    getRecentResults(4),
    getNewsPosts(6),
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
                  "radial-gradient(ellipse 85% 90% at 50% 40%, black 45%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 85% 90% at 50% 40%, black 45%, transparent 100%)",
              }}
            />
            <div className="absolute inset-0 bg-ink/45" />
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
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight">
            {settings?.tournament_title ?? "Torneo di Pallanuoto"}
          </h1>
          {settings?.tournament_subtitle && (
            <p className="mt-1 text-sm text-muted">{settings.tournament_subtitle}</p>
          )}

          {news.length > 0 && <NewsStrip news={news} />}
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
          <section className="grid grid-cols-3 gap-3 px-5 py-5">
            <Link
              href="/calendario"
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface py-4 text-center transition active:scale-95"
            >
              <CalendarDays size={20} className="text-primary" />
              <span className="text-[11px] font-medium">Calendario</span>
            </Link>
            <Link
              href="/classifiche"
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface py-4 text-center transition active:scale-95"
            >
              <Trophy size={20} className="text-gold" />
              <span className="text-[11px] font-medium">Classifiche</span>
            </Link>
            <Link
              href="/classifiche#marcatori"
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface py-4 text-center transition active:scale-95"
            >
              <ListOrdered size={20} className="text-gold" />
              <span className="text-[11px] font-medium">Marcatori</span>
            </Link>
          </section>

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

          <section className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
                Prossimi match
              </h2>
              <Link href="/calendario" className="text-xs text-primary">Vedi tutti</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted">Nessun match in programma al momento.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </section>

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
