import Image from "next/image";
import type { Player } from "@/lib/supabase/types";

export default function Podium({ scorers }: { scorers: Player[] }) {
  const [first, second, third, ...rest] = scorers;
  const podiumOrder = [second, first, third].filter(Boolean) as Player[];
  const heights = ["h-20", "h-28", "h-16"];

  return (
    <div>
      <div className="flex items-end justify-center gap-3 px-2 pt-4">
        {podiumOrder.map((p, i) => (
          <div key={p.id} className="flex flex-1 flex-col items-center">
            {p.photo_url ? (
              <Image
                src={p.photo_url}
                alt={`${p.first_name} ${p.last_name}`}
                width={56}
                height={56}
                className="mb-2 h-14 w-14 rounded-full border-2 border-gold object-cover"
              />
            ) : (
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-surface-raised font-display text-sm text-gold">
                {p.first_name[0]}
                {p.last_name[0]}
              </div>
            )}
            <p className="max-w-[80px] truncate text-center text-xs font-medium">{p.last_name}</p>
            <p className="font-display text-lg font-bold text-gold">{p.goals_count}</p>
            <div
              className={`mt-2 w-full ${heights[i]} rounded-t-lg border border-line bg-gradient-to-t from-gold/25 to-transparent`}
            />
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <ol className="mt-6 space-y-2">
          {rest.map((p, idx) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="w-4 text-xs text-muted">{idx + 4}</span>
                <span className="text-sm">{p.first_name} {p.last_name}</span>
              </div>
              <span className="font-display tabular font-semibold text-gold">{p.goals_count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
