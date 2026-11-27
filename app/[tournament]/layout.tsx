import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import RootHtml from "@/components/RootHtml";
import BottomNav from "@/components/BottomNav";
import TopRightControls from "@/components/TopRightControls";
import { getTournamentBySlug } from "@/lib/queries";
import { brandVarsFor, themeClassFor } from "@/lib/theme";

// Root layout of the public site. It lives in the [tournament] segment so
// the theme, colours, tab title and favicon follow the tournament in the URL.
export async function generateMetadata({ params }: { params: { tournament: string } }): Promise<Metadata> {
  const tournament = await getTournamentBySlug(params.tournament);
  return {
    title: tournament?.tournament_title || "Torneo",
    description: "Calendario, classifiche e risultati live del torneo.",
    icons: tournament?.logo_url ? { icon: tournament.logo_url } : undefined,
  };
}

export default async function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tournament: string };
}) {
  const tournament = await getTournamentBySlug(params.tournament);
  if (!tournament) notFound();

  return (
    <RootHtml themeClass={themeClassFor(tournament)} brandVars={brandVarsFor(tournament)}>
      <div className="flex min-h-screen flex-col pb-24">{children}</div>
      <TopRightControls settings={tournament} />
      <BottomNav slug={tournament.slug} />
    </RootHtml>
  );
}
