import type { Metadata } from "next";
import { cookies } from "next/headers";
import "../globals.css";
import RootHtml from "@/components/RootHtml";
import AdminShell from "@/components/admin/AdminShell";
import { getTournaments } from "@/lib/queries";
import { ADMIN_TOURNAMENT_COOKIE } from "@/lib/admin-tournament";
import { brandVarsFor } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Root layout of the Admin panel. It always uses the Classic look (no theme
// class), whatever theme the public site of the tournament uses.
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { tournaments, error } = await getTournaments();
  const cookieId = cookies().get(ADMIN_TOURNAMENT_COOKIE)?.value ?? null;
  const current = tournaments.find((t) => t.id === cookieId) ?? tournaments[0] ?? null;

  return (
    <RootHtml brandVars={brandVarsFor(current)}>
      <AdminShell initialTournaments={tournaments} initialId={current?.id ?? null} initialError={error}>
        {children}
      </AdminShell>
    </RootHtml>
  );
}
