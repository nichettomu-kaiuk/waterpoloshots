import { getAllMatches } from "@/lib/queries";
import { getChampionshipOrNotFound } from "@/lib/championship";
import Hero from "@/components/Hero";
import CalendarClient from "./CalendarClient";

export default async function CalendarioPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { girone?: string; q?: string };
}) {
  const championship = await getChampionshipOrNotFound(params.slug);
  const matches = await getAllMatches(championship.id, searchParams.girone, searchParams.q);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero championshipId={championship.id} />
      <div className="px-5 py-6 lg:px-8">
        <h1 className="mb-4 font-display text-2xl font-bold">Calendario</h1>
        <CalendarClient matches={matches} girone={searchParams.girone ?? ""} q={searchParams.q ?? ""} />
      </div>
    </main>
  );
}
