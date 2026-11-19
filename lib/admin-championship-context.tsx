"use client";

import { createContext, useContext } from "react";
import type { Championship } from "@/lib/supabase/types";

// Provided by app/admin/[slug]/layout.tsx (which resolves the championship
// server-side) so every "use client" admin page under it — teams, players,
// matches, venues, news, settings — can scope its Supabase queries to
// `championship_id` without each one re-fetching the championship by slug.
const ChampionshipContext = createContext<Championship | null>(null);

export function ChampionshipProvider({
  championship,
  children,
}: {
  championship: Championship;
  children: React.ReactNode;
}) {
  return <ChampionshipContext.Provider value={championship}>{children}</ChampionshipContext.Provider>;
}

// Only ever used inside app/admin/[slug]/..., where the provider above is
// always present — throws loudly instead of silently scoping nothing if a
// page is ever moved out from under it by mistake.
export function useChampionship(): Championship {
  const championship = useContext(ChampionshipContext);
  if (!championship) {
    throw new Error("useChampionship() used outside app/admin/[slug]/layout.tsx");
  }
  return championship;
}
