import { getTopScorers } from "@/lib/queries";
import Hero from "@/components/Hero";
import Podium from "@/components/Podium";
import ShareButton from "@/components/ShareButton";

export default async function MarcatoriPage() {
  const allScorers = await getTopScorers(15);
  const scorers = allScorers.filter((p) => p.goals_count > 0);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Marcatori</h1>
          <ShareButton title="Marcatori" path="/marcatori" />
        </div>

        {scorers.length === 0 ? (
          <p className="text-sm text-muted">Nessun gol registrato ancora.</p>
        ) : (
          <Podium scorers={scorers} />
        )}
      </div>
    </main>
  );
}
