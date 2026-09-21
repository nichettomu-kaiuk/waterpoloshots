import { UserRound } from "lucide-react";
import { getAllPlayers } from "@/lib/queries";
import { getChampionshipOrNotFound } from "@/lib/championship";
import Hero from "@/components/Hero";
import GiocatoriClient from "./GiocatoriClient";

export default async function GiocatoriPage({ params }: { params: { slug: string } }) {
  const championship = await getChampionshipOrNotFound(params.slug);
  const players = await getAllPlayers(championship.id);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero championshipId={championship.id} slug={params.slug} />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2">
          <UserRound size={20} className="text-primary" />
          <h1 className="font-display text-2xl font-bold">Giocatori</h1>
        </div>

        <GiocatoriClient players={players} />
      </div>
    </main>
  );
}
