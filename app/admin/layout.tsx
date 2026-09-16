"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield, Users, UserRound, MapPinned, Palette, Newspaper, Trophy } from "lucide-react";

// This chrome wraps every /admin/* route, including the campionati manager
// at /admin itself (no active tournament yet) and every tournament-scoped
// section under /admin/[slug]/... — derives which one it's in from the URL
// path (parsing params here would need a slug-aware layout at this level,
// which this one isn't) rather than needing a prop.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <div className="mx-auto w-full max-w-sm">{children}</div>;

  const segments = pathname.split("/").filter(Boolean); // e.g. [] -> ["admin"], ["admin","<slug>","matches"]
  const slug = segments.length > 1 ? segments[1] : null;

  if (!slug) {
    // /admin itself: the campionati manager. No tournament is active yet,
    // so there's no CRUD subnav to show.
    return (
      <div className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
        <header className="border-b border-line px-5 py-4 lg:px-8">
          <p className="text-[11px] uppercase tracking-widest text-gold">Pannello di controllo</p>
          <h1 className="font-display text-xl font-bold">Campionati</h1>
        </header>
        <div className="px-5 py-5 lg:px-8">{children}</div>
      </div>
    );
  }

  const links = [
    { href: `/admin/${slug}`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/admin/${slug}/matches`, label: "Partite", icon: Shield },
    { href: `/admin/${slug}/teams`, label: "Squadre", icon: Users },
    { href: `/admin/${slug}/players`, label: "Giocatori", icon: UserRound },
    { href: `/admin/${slug}/venues`, label: "Piscine", icon: MapPinned },
    { href: `/admin/${slug}/news`, label: "News", icon: Newspaper },
    { href: `/admin/${slug}/settings`, label: "Impostazioni", icon: Palette },
  ];

  return (
    <div className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <header className="border-b border-line px-5 py-4 lg:px-8">
        <Link href="/admin" className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-widest text-gold hover:text-white">
          <Trophy size={12} /> Campionati
        </Link>
        <h1 className="font-display text-xl font-bold">Admin</h1>
      </header>

      <nav className="scrollbar-none flex gap-2 overflow-x-auto border-b border-line px-5 py-3 lg:px-8">
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

      <div className="px-5 py-5 lg:px-8">{children}</div>
    </div>
  );
}
