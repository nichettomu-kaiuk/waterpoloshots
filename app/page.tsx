import Link from "next/link";
import { CalendarDays, Trophy, ListOrdered } from "lucide-react";
import { getSettings, getLiveMatches, getUpcomingMatches, getRecentResults } from "@/lib/queries";
import MatchCard from "@/components/MatchCard";
import LiveBadge from "@/components/LiveBadge";

export default async function HomePage() {
  const [settings, live, upcoming, recent] = await Promise.all([
    getSettings(),
    getLiveMatches(),
    getUpcomingMatches(4),
    getRecentResults(4),
  ]);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <section
        className="relative overflow-hidden border-b border-line water-texture px-5 pb-8 pt-10"
        style={
          settings?.home_bg_url
            ? { backgroundImage: `url(${settings.home_bg_url})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {settings?.home_bg_url && <div className="absolute inset-0 bg-ink/75" />}
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
        </div>
      </section>

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
    </main>
  );
}
