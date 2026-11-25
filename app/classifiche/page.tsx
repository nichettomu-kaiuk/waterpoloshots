import Link from "next/link";
import Image from "next/image";
import { getStandings, getTopScorers } from "@/lib/queries";
import Hero from "@/components/Hero";
import ShareButton from "@/components/ShareButton";
import ScorersList from "@/components/ScorersList";

export default async function ClassifichePage() {
  const [standings, allScorers] = await Promise.all([getStandings(), getTopScorers()]);
  const scorers = allScorers.filter((p) => p.goals_count > 0);

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Classifiche</h1>
          <ShareButton title="Classifiche" path="/classifiche" />
        </div>

        {/* Mobile: the two rankings stack. Desktop (lg+): side by side, the
            team standings on the left and the scorers on the right. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted">
          Classifica
        </h2>
        {standings.length === 0 ? (
          <p className="text-sm text-muted">Nessun risultato confermato ancora.</p>
        ) : (
          <div className="site-card overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[470px] text-sm">
              <thead className="bg-surface-raised text-[11px] uppercase text-muted">
                <tr>
                  <th className="sticky left-0 w-6 min-w-[24px] max-w-[24px] bg-surface-raised px-0 py-2 text-center">#</th>
                  <th className="sticky left-6 bg-surface-raised px-2 py-2 text-left">Squadra</th>
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
                    <td className="rank-box sticky left-0 w-6 min-w-[24px] max-w-[24px] bg-surface px-0 py-2.5 text-center text-muted"><span>{i + 1}</span></td>
                    <td className="sticky left-6 bg-surface px-2 py-2.5">
                      <Link href={`/squadra/${row.team.id}`} className="flex items-center gap-2 font-medium">
                        {row.team.logo_url ? (
                          <span className="cap-badge relative inline-block h-[22px] w-[22px] shrink-0">
                            <Image
                              src={row.team.logo_url}
                              alt={row.team.name}
                              width={22}
                              height={22}
                              className="h-[22px] w-[22px] rounded-full border border-line object-cover"
                            />
                          </span>
                        ) : (
                          <span className="cap-badge relative flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-line bg-surface-raised text-[9px] font-display text-muted">
                            {row.team.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="max-w-[110px] break-words leading-tight">{row.team.name}</span>
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

        </section>

        <section className="min-w-0">
        <h2 id="marcatori" className="mb-3 mt-8 font-display text-sm font-semibold uppercase tracking-widest text-muted lg:mt-0">
          Marcatori
        </h2>
        {scorers.length === 0 ? (
          <p className="text-sm text-muted">Nessun gol registrato ancora.</p>
        ) : (
          <ScorersList scorers={scorers} />
        )}
        </section>
        </div>
      </div>
    </main>
  );
}
