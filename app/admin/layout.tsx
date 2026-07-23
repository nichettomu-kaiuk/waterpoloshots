"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield, Users, UserRound, MapPinned, Palette } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/matches", label: "Partite", icon: Shield },
  { href: "/admin/teams", label: "Squadre", icon: Users },
  { href: "/admin/players", label: "Giocatori", icon: UserRound },
  { href: "/admin/venues", label: "Campi", icon: MapPinned },
  { href: "/admin/settings", label: "Branding", icon: Palette },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <div>{children}</div>;

  return (
    <div>
      <header className="border-b border-line px-5 py-4">
        <p className="text-[11px] uppercase tracking-widest text-gold">Pannello di controllo</p>
        <h1 className="font-display text-xl font-bold">Admin</h1>
      </header>

      <nav className="scrollbar-none flex gap-2 overflow-x-auto border-b border-line px-5 py-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary hover:text-white"
          >
            <Icon size={13} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-5 py-5">{children}</div>
    </div>
  );
}
