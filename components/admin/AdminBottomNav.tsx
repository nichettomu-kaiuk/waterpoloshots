"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield, Users, UserRound, MapPinned, Newspaper, Palette } from "lucide-react";
import clsx from "clsx";

// Admin counterpart of components/BottomNav.tsx (public site): same fixed
// bottom bar look, colors and behavior (it reuses the .bottom-nav /
// .bottom-nav-item classes from globals.css, so it automatically matches
// whatever the current theme's active-state styling looks like — including,
// since AdminChampionshipShell now wraps this nav in the championship's
// theme class/colors too, the theme actually chosen for that campionato and
// not just the default one), just pointed at the current championship's
// admin routes instead of the public ones. It's the only nav in the admin
// section (the horizontal one that used to sit above the page content was
// removed as a duplicate).
//
// Ordine richiesto esplicitamente dall'utente (non alfabetico né legato al
// flusso di lavoro): Dashboard, Impostazioni, News, Squadre, Giocatori,
// Partite, Piscine.
const items = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Impostazioni", icon: Palette },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/teams", label: "Squadre", icon: Users },
  { href: "/players", label: "Giocatori", icon: UserRound },
  { href: "/matches", label: "Partite", icon: Shield },
  { href: "/venues", label: "Piscine", icon: MapPinned },
];

export default function AdminBottomNav({ base }: { base: string }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-ink/95 backdrop-blur lg:max-w-5xl xl:max-w-6xl">
      <ul className="grid grid-cols-7">
        {items.map(({ href, label, icon: Icon }) => {
          const fullHref = `${base}${href}`;
          const active = pathname === fullHref;
          return (
            <li key={href}>
              <Link
                href={fullHref}
                className={clsx("bottom-nav-item flex w-full flex-col items-center gap-0.5 py-2 text-center", active && "is-active")}
              >
                <Icon
                  size={17}
                  strokeWidth={2.2}
                  className={clsx("bottom-nav-icon", active ? "text-primary" : "text-muted")}
                />
                <span className={clsx("text-[9px] font-medium leading-tight", active ? "text-white" : "text-muted")}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
