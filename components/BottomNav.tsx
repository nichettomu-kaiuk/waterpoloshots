"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Trophy, Users, UserRound, Newspaper } from "lucide-react";
import clsx from "clsx";

// Mirrors the quick-nav bento-grid on the home page, plus Home restored in
// its original first position. Classifica + Marcatori are merged into one
// "Classifiche" page/link. Every link is prefixed with the active
// campionato's slug (see app/[slug]/layout.tsx, which renders this).
export default function BottomNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  const items = [
    { href: `/${slug}`, label: "Home", icon: Home },
    { href: `/${slug}/calendario`, label: "Calendario", icon: CalendarDays },
    { href: `/${slug}/classifiche`, label: "Classifiche", icon: Trophy },
    { href: `/${slug}/squadre`, label: "Squadre", icon: Users },
    { href: `/${slug}/giocatori`, label: "Giocatori", icon: UserRound },
    { href: `/${slug}/news`, label: "News", icon: Newspaper },
  ];

  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-ink/95 backdrop-blur lg:max-w-5xl xl:max-w-6xl">
      <ul className="grid grid-cols-6">
        {items.map(({ href, label, icon: Icon }) => {
          const basePath = href.split("#")[0];
          const active = pathname === basePath;
          return (
            <li key={href}>
              <Link
                href={href}
                className={clsx("bottom-nav-item flex w-full flex-col items-center gap-0.5 py-2 text-center", active && "is-active")}
              >
                <Icon
                  size={18}
                  strokeWidth={2.2}
                  className={clsx("bottom-nav-icon", active ? "text-primary" : "text-muted")}
                />
                <span className={clsx("text-[10px] font-medium leading-tight", active ? "text-white" : "text-muted")}>
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
