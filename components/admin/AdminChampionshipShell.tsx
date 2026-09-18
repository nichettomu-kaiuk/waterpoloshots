"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Shield, Users, UserRound, MapPinned, Palette, Newspaper } from "lucide-react";
import { ChampionshipProvider } from "@/lib/admin-championship-context";
import AdminBottomNav from "@/components/admin/AdminBottomNav";
import type { Championship } from "@/lib/supabase/types";

export default function AdminChampionshipShell({
  championship,
  children,
}: {
  championship: Championship;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/admin/${championship.slug}`;
  const links = [
    { href: base, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/matches`, label: "Partite", icon: Shield },
    { href: `${base}/teams`, label: "Squadre", icon: Users },
    { href: `${base}/players`, label: "Giocatori", icon: UserRound },
    { href: `${base}/venues`, label: "Piscine", icon: MapPinned },
    { href: `${base}/news`, label: "News", icon: Newspaper },
    { href: `${base}/settings`, label: "Impostazioni", icon: Palette },
  ];

  return (
    <ChampionshipProvider championship={championship}>
      <div className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
        <header className="border-b border-line px-5 py-4 lg:px-8">
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-[11px] text-muted hover:text-white">
            <ArrowLeft size={12} /> Tutti i campionati
          </Link>
          <p className="text-[11px] uppercase tracking-widest text-gold">Pannello di controllo</p>
          <h1 className="font-display text-xl font-bold">{championship.name}</h1>
        </header>

        <nav className="scrollbar-none flex gap-2 overflow-x-auto border-b border-line px-5 py-3 lg:px-8">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                pathname === href
                  ? "border-primary text-white"
                  : "border-line text-muted hover:border-primary hover:text-white"
              }`}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-5 pb-24 pt-5 lg:px-8">{children}</div>
      </div>

      <AdminBottomNav base={base} />
    </ChampionshipProvider>
  );
}
