"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Trophy, Users, UserRound, Newspaper } from "lucide-react";
import clsx from "clsx";

// Mirrors the quick-nav bento-grid on the home page, plus Home restored in
// its original first position. Classifica + Marcatori are merged into one
// "Classifiche" page/link.
// Paths are relative to the tournament: they get "/<slug>" in front.
const items = [
  { path: "", label: "Home", icon: Home },
  { path: "/calendario", label: "Calendario", icon: CalendarDays },
  { path: "/classifiche", label: "Classifiche", icon: Trophy },
  { path: "/squadre", label: "Squadre", icon: Users },
  { path: "/giocatori", label: "Giocatori", icon: UserRound },
  { path: "/news", label: "News", icon: Newspaper },
];

export default function BottomNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-ink/95 backdrop-blur lg:max-w-5xl xl:max-w-6xl">
      <ul className="grid grid-cols-6">
        {items.map(({ path, label, icon: Icon }) => {
          const href = `/${slug}${path}`;
          const active = pathname === href;
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
