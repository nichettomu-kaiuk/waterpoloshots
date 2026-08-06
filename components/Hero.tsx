import Image from "next/image";
import Link from "next/link";
import { Facebook, Youtube } from "lucide-react";
import { getSettings, getLiveMatches } from "@/lib/queries";
import type { Match, Settings } from "@/lib/supabase/types";
import LiveBadge from "./LiveBadge";

// Shared across every public page (fetches its own data unless the caller
// already has it — the home page passes settings/live down to avoid
// double-querying, since it needs the same data for its own sections).
export default async function Hero({
  settings: settingsProp,
  live: liveProp,
}: {
  settings?: Settings | null;
  live?: Match[];
} = {}) {
  const settings = settingsProp !== undefined ? settingsProp : await getSettings();
  const live = liveProp !== undefined ? liveProp : await getLiveMatches();

  return (
    <section className="app-hero relative overflow-hidden water-texture px-5 pb-12 pt-10">
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
        <p className="hero-eyebrow text-xs uppercase tracking-[0.2em] text-gold">
          {settings?.active_round ?? "Girone di andata"}
        </p>

        {live.length > 0 && (
          <div className="mt-2">
            <LiveBadge />
          </div>
        )}

        <div className="mt-2 flex items-start gap-3">
          {settings?.logo_url && (
            <Image
              src={settings.logo_url}
              alt={settings.tournament_title ?? "Logo torneo"}
              width={60}
              height={60}
              className="h-[60px] w-[60px] shrink-0 self-center rounded-full border border-gold/50 object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
              {settings?.tournament_title ?? "Serie B - Girone 3"}
            </h1>
            <div className="mt-1 flex items-center justify-between gap-3">
              {settings?.tournament_subtitle ? (
                <p className="text-sm text-muted">{settings.tournament_subtitle}</p>
              ) : (
                <span />
              )}
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="https://www.facebook.com/wpshots"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pagina Facebook Waterpolo Shots"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-ink/50 text-muted backdrop-blur transition hover:border-gold hover:text-gold"
                >
                  <Facebook size={15} />
                </Link>
                <Link
                  href="https://www.youtube.com/@waterpoloshots"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Canale YouTube Waterpolo Shots"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-ink/50 text-muted backdrop-blur transition hover:border-gold hover:text-gold"
                >
                  <Youtube size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
