import Link from "next/link";
import Image from "next/image";
import { getStandings } from "@/lib/queries";
import Hero from "@/components/Hero";
import ShareButton from "@/components/ShareButton";

export default async function ClassificaPage() {
  const standings = await getStandings();

  return (
    <main className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
      <Hero />
      <div className="px-5 py-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Classifica</h1>
        <ShareButton title="Classifica" path="/classifiche" />
      </div>

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
                  <td className="rank-box sticky left-0 bg-surface px-3 py-2.5 text-muted"><span>{i + 1}</span></td>
                  <td className="sticky left-8 bg-surface px-3 py-2.5">
                    <Link href={`/squadra/${row.team.id}`} className="flex items-center gap-2 font-medium">
                      {row.team.logo_url ? (
                        <Image
                          src={row.team.logo_url}
                          alt={row.team.name}
                          width={22}
                          height={22}
                          className="h-[22px] w-[22px] shrink-0 rounded-full border border-line object-cover"
                        />
                      ) : (
                        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-line bg-surface-raised text-[9px] font-display text-muted">
                          {row.team.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span className="whitespace-nowrap">{row.team.name}</span>
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
      </div>
    </main>
  );
}
