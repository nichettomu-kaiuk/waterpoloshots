import { UserRound } from "lucide-react";
import { getAllPlayers } from "@/lib/queries";
import GiocatoriClient from "./GiocatoriClient";

export default async function GiocatoriPage() {
  const players = await getAllPlayers();

  return (
    <main className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
      <div className="mb-5 flex items-center gap-2">
        <UserRound size={20} className="text-primary" />
        <h1 className="font-display text-2xl font-bold">Giocatori</h1>
      </div>

      <GiocatoriClient players={players} />
    </main>
  );
}
