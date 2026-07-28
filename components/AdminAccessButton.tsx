"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";

// Small, unobtrusive corner shortcut to the Admin panel — kept out of the
// bottom nav (which now mirrors the public quick-nav) so the admin can still
// reach /admin in one tap from anywhere on the public site.
export default function AdminAccessButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <Link
      href="/admin"
      aria-label="Pannello Admin"
      className="fixed right-3 top-3 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-ink/70 text-muted backdrop-blur transition hover:border-gold hover:text-gold"
    >
      <Lock size={15} />
    </Link>
  );
}
