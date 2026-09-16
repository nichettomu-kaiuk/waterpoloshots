import { notFound } from "next/navigation";
import { getTournamentBySlug } from "@/lib/queries";
import { TournamentProvider } from "@/lib/tournament-context";

// Resolves the campionato from the URL once, server-side, and makes it
// available to every "use client" CRUD page nested under /admin/[slug]/...
// via useTournament() — see lib/tournament-context.tsx.
export default async function AdminTournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const tournament = await getTournamentBySlug(params.slug);
  if (!tournament) notFound();

  return <TournamentProvider tournament={tournament}>{children}</TournamentProvider>;
}
