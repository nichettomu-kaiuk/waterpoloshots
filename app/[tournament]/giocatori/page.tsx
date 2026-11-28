import { UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { getAllPlayers, getTournamentBySlug, getLiveMatches } from "@/lib/queries";
import Hero from "@/components/Hero";
import GiocatoriClient from "./GiocatoriClient";

export default async function GiocatoriPage({ params }: { params: { tournament: string } }) {
  const tournament = await getTournamentBySlug(params.tournament);
  if (!tournament) notFound();
  // The Hero (rendered later) needs the live matches: start loading them now,
  // in parallel with this page's own queries.
  getLiveMatches(tournament.id);
  const players = await getAllPlayers(tournament.id);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero tournament={tournament} />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2">
          <UserRound size={20} className="text-primary" />
          <h1 className="font-display text-2xl font-bold">Giocatori</h1>
        </div>

        <GiocatoriClient players={players} slug={tournament.slug} />
      </div>
    </main>
  );
}
