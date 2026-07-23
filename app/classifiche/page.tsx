import Link from "next/link";
import { getStandings, getTopScorers } from "@/lib/queries";
import Podium from "@/components/Podium";

export default async function ClassifichePage() {
  const [standings, scorers] = await Promise.all([getStandings(), getTopScorers(15)]);

  return (
    <main className="mx-auto w-full max-w-md px-5 py-6">
      <h1 className="mb-5 font-display text-2xl font-bold">Classifiche</h1>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted">
          Classifica squadre
        </h2>
        {standings.length === 0 ? (
          <p className="text-sm text-muted">Nessun risultato confermato ancora.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-surface-raised text-[11px] uppercase text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Squadra</th>
                  <th className="px-2 py-2 text-center">G</th>
                  <th className="px-2 py-2 text-center">DR</th>
                  <th className="px-2 py-2 text-center">Pt</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => (
                  <tr key={row.team.id} className="border-t border-line bg-surface">
                    <td className="px-3 py-2.5 text-muted">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <Link href={`/squadra/${row.team.id}`} className="font-medium">
                        {row.team.name}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-center tabular text-muted">{row.played}</td>
                    <td className="px-2 py-2.5 text-center tabular text-muted">
                      {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
                    </td>
                    <td className="px-2 py-2.5 text-center tabular font-display font-bold text-gold">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="marcatori">
        <h2 className="mb-1 font-display text-sm font-semibold uppercase tracking-widest text-muted">
          Classifica marcatori
        </h2>
        {scorers.length === 0 ? (
          <p className="text-sm text-muted">Nessun gol registrato ancora.</p>
        ) : (
          <Podium scorers={scorers} />
        )}
      </section>
    </main>
  );
}
