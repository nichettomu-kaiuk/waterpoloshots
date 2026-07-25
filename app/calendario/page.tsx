import { getAllMatches } from "@/lib/queries";
import Hero from "@/components/Hero";
import CalendarClient from "./CalendarClient";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: { girone?: string; q?: string };
}) {
  const matches = await getAllMatches(searchParams.girone, searchParams.q);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <h1 className="mb-4 font-display text-2xl font-bold">Calendario</h1>
        <CalendarClient matches={matches} girone={searchParams.girone ?? ""} q={searchParams.q ?? ""} />
      </div>
    </main>
  );
}
