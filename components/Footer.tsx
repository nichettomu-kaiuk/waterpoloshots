"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Youtube, Mail } from "lucide-react";
import type { Settings } from "@/lib/supabase/types";

// The app never had a real footer — the only bottom-of-page content was the
// floating "i" Credits popover (TopRightControls), reachable but easy to
// miss and disconnected from the page flow. This renders once, in
// RootLayout, after every page's own content and before the mobile
// BottomNav's reserved space, so it reads as the natural end of the page on
// both mobile and desktop instead of pages just stopping abruptly.
export default function Footer({ settings }: { settings: Settings | null }) {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="site-footer mt-10 border-t border-line px-5 py-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 text-center lg:max-w-5xl lg:flex-row lg:justify-between lg:text-left xl:max-w-6xl">
        <div>
          <p className="font-display text-sm font-bold">
            {settings?.tournament_title ?? "Serie B - Girone 3"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {settings?.tournament_subtitle ?? "Calendario, classifiche e risultati live del torneo."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="https://www.facebook.com/wpshots"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pagina Facebook Waterpolo Shots"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition hover:border-gold hover:text-gold"
          >
            <Facebook size={15} />
          </Link>
          <Link
            href="https://www.youtube.com/@waterpoloshots"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Canale YouTube Waterpolo Shots"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition hover:border-gold hover:text-gold"
          >
            <Youtube size={15} />
          </Link>
          {settings?.info_email && (
            <a
              href={`mailto:${settings.info_email}`}
              aria-label="Contatta via email"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition hover:border-gold hover:text-gold"
            >
              <Mail size={15} />
            </a>
          )}
        </div>

        <p className="text-[11px] text-muted">
          © {year} {settings?.tournament_title ?? "Waterpolo Shots"} ·{" "}
          <Link href="/admin" className="hover:text-gold">
            Admin
          </Link>
        </p>
      </div>
    </footer>
  );
}
