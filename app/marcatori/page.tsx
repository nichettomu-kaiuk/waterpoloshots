import { getTopScorers } from "@/lib/queries";
import Hero from "@/components/Hero";
import Podium from "@/components/Podium";

export default async function MarcatoriPage() {
  const scorers = await getTopScorers(15);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <h1 className="mb-5 font-display text-2xl font-bold">Marcatori</h1>

        {scorers.length === 0 ? (
          <p className="text-sm text-muted">Nessun gol registrato ancora.</p>
        ) : (
          <Podium scorers={scorers} />
        )}
      </div>
    </main>
  );
}
