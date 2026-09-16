"use client";

import { createContext, useContext } from "react";
import type { Tournament } from "@/lib/supabase/types";

// Makes the active campionato (resolved once, server-side, from the /admin/
// [slug] URL segment) available to every "use client" CRUD page nested
// under it — matches, teams, players, venues, news, settings — without
// re-fetching it in each one. See app/admin/[slug]/layout.tsx for the
// provider and PROJECT_STATUS.md, "Multi-campionato", for the full picture.
const TournamentContext = createContext<Tournament | null>(null);

export function TournamentProvider({
  tournament,
  children,
}: {
  tournament: Tournament;
  children: React.ReactNode;
}) {
  return <TournamentContext.Provider value={tournament}>{children}</TournamentContext.Provider>;
}

export function useTournament(): Tournament {
  const tournament = useContext(TournamentContext);
  if (!tournament) {
    throw new Error("useTournament() must be used inside /admin/[slug] (missing TournamentProvider).");
  }
  return tournament;
}
