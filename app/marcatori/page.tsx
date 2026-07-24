import { getTopScorers } from "@/lib/queries";
import Podium from "@/components/Podium";

export default async function MarcatoriPage() {
  const scorers = await getTopScorers(15);

  return (
    <main className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
      <h1 className="mb-5 font-display text-2xl font-bold">Marcatori</h1>

      {scorers.length === 0 ? (
        <p className="text-sm text-muted">Nessun gol registrato ancora.</p>
      ) : (
        <Podium scorers={scorers} />
      )}
    </main>
  );
}
