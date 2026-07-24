"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Trophy, ListOrdered, Users, UserRound, Newspaper } from "lucide-react";
import clsx from "clsx";

// Mirrors the quick-nav bento-grid on the home page, plus Home restored in
// its original first position.
const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/classifiche", label: "Classifica", icon: Trophy },
  { href: "/marcatori", label: "Marcatori", icon: ListOrdered },
  { href: "/squadre", label: "Squadre", icon: Users },
  { href: "/giocatori", label: "Giocatori", icon: UserRound },
  { href: "/news", label: "News", icon: Newspaper },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-ink/95 backdrop-blur lg:max-w-5xl xl:max-w-6xl">
      <ul className="grid grid-cols-7">
        {items.map(({ href, label, icon: Icon }) => {
          const basePath = href.split("#")[0];
          const active = pathname === basePath;
          return (
            <li key={href}>
              <Link
                href={href}
                className="flex w-full flex-col items-center gap-0.5 py-2 text-center"
              >
                <Icon
                  size={18}
                  strokeWidth={2.2}
                  className={clsx(active ? "text-primary" : "text-muted")}
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
