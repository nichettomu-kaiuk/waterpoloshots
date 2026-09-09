"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Trophy, Users, UserRound, Newspaper } from "lucide-react";
import clsx from "clsx";
import type { Settings } from "@/lib/supabase/types";

// Desktop-only counterpart to BottomNav (which stays mobile-only, see
// globals.css/.bottom-nav `lg:hidden`). A fixed bottom tab bar stretched
// across a 1152px-wide desktop layout reads as a mobile leftover, so from
// `lg` up navigation moves into this sticky top bar instead — same six
// destinations, same active-state logic, just laid out horizontally next
// to the tournament brand.
//
// The two floating corner icons (Credits / Admin, see TopRightControls)
// stay a single shared component and keep their own modal state; on
// desktop this bar simply reserves empty space on its right edge
// (`lg:pr-24`) so they land inside the bar's visual row instead of
// floating disconnected above it.
const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/classifiche", label: "Classifiche", icon: Trophy },
  { href: "/squadre", label: "Squadre", icon: Users },
  { href: "/giocatori", label: "Giocatori", icon: UserRound },
  { href: "/news", label: "News", icon: Newspaper },
];

export default function TopNav({ settings }: { settings: Settings | null }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="top-nav sticky top-0 z-30 hidden border-b border-line bg-ink/95 backdrop-blur lg:block">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-8 xl:max-w-6xl">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          {settings?.logo_url && (
            <Image
              src={settings.logo_url}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full border border-gold/50 object-cover"
            />
          )}
          <span className="truncate font-display text-base font-bold tracking-tight">
            {settings?.tournament_title ?? "Serie B - Girone 3"}
          </span>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "top-nav-item flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition",
                  active ? "is-active text-white" : "text-muted hover:text-white"
                )}
              >
                <Icon size={16} className={active ? "text-primary" : "text-muted"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Reserved space for the floating Credits/Admin icons (TopRightControls),
            which reposition themselves to this row at `lg` — see globals.css. */}
        <div className="w-24 shrink-0" aria-hidden="true" />
      </div>
    </header>
  );
}
