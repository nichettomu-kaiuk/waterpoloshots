import Link from "next/link";
import { getStandings } from "@/lib/queries";

export default async function ClassificaPage() {
  const standings = await getStandings();

  return (
    <main className="mx-auto w-full max-w-md px-5 py-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
      <h1 className="mb-5 font-display text-2xl font-bold">Classifica</h1>

      {standings.length === 0 ? (
        <p className="text-sm text-muted">Nessun risultato confermato ancora.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-raised text-[11px] uppercase text-muted">
              <tr>
                <th className="sticky left-0 bg-surface-raised px-3 py-2 text-left">#</th>
                <th className="sticky left-8 bg-surface-raised px-3 py-2 text-left">Squadra</th>
                <th className="px-2 py-2 text-center">Pt</th>
                <th className="px-2 py-2 text-center">G</th>
                <th className="px-2 py-2 text-center">V</th>
                <th className="px-2 py-2 text-center">P</th>
                <th className="px-2 py-2 text-center">N</th>
                <th className="px-2 py-2 text-center">GF</th>
                <th className="px-2 py-2 text-center">GS</th>
                <th className="px-2 py-2 text-center">DR</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => (
                <tr key={row.team.id} className="border-t border-line bg-surface">
                  <td className="sticky left-0 bg-surface px-3 py-2.5 text-muted">{i + 1}</td>
                  <td className="sticky left-8 bg-surface px-3 py-2.5">
                    <Link href={`/squadra/${row.team.id}`} className="font-medium">
                      {row.team.name}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-center tabular font-display font-bold text-gold">
                    {row.points}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular text-muted">{row.played}</td>
                  <td className="px-2 py-2.5 text-center tabular text-muted">{row.won}</td>
                  <td className="px-2 py-2.5 text-center tabular text-muted">{row.lost}</td>
                  <td className="px-2 py-2.5 text-center tabular text-muted">{row.drawn}</td>
                  <td className="px-2 py-2.5 text-center tabular text-muted">{row.goals_for}</td>
                  <td className="px-2 py-2.5 text-center tabular text-muted">{row.goals_against}</td>
                  <td className="px-2 py-2.5 text-center tabular text-muted">
                    {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {standings.length > 0 && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Pt Punti · G Giocate · V Vinte · P Perse · N Neutre · GF Gol fatti · GS Gol subiti · DR Differenza reti
        </p>
      )}
    </main>
  );
}
