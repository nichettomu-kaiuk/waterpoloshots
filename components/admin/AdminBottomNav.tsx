"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield, Users, UserRound, MapPinned, Newspaper, Palette } from "lucide-react";
import clsx from "clsx";

// Admin counterpart of components/BottomNav.tsx (public site): same fixed
// bottom bar look, colors and behavior (it reuses the .bottom-nav /
// .bottom-nav-item classes from globals.css, so it automatically matches
// whatever the current theme's active-state styling looks like), just
// pointed at the current championship's admin routes instead of the public
// ones. This mirrors the same links already offered by the horizontal chip
// nav in AdminChampionshipShell above the page content — that one stays for
// quick scanning of every section at a glance, this one keeps them reachable
// with a thumb on mobile without scrolling back to the top of the page.
const items = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "/matches", label: "Partite", icon: Shield },
  { href: "/teams", label: "Squadre", icon: Users },
  { href: "/players", label: "Giocatori", icon: UserRound },
  { href: "/venues", label: "Piscine", icon: MapPinned },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/settings", label: "Impostazioni", icon: Palette },
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
