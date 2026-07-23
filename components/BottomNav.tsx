"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Trophy, ShieldCheck } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/classifiche", label: "Classifiche", icon: Trophy },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-ink/95 backdrop-blur">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-3 text-[11px] font-medium tracking-wide"
              >
                <Icon
                  size={20}
                  strokeWidth={2.2}
                  className={clsx(active ? "text-primary" : "text-muted")}
                />
                <span className={clsx(active ? "text-white" : "text-muted")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
