"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_TOURNAMENT_COOKIE } from "@/lib/admin-tournament";
import type { Settings } from "@/lib/supabase/types";

interface AdminTournamentContextValue {
  tournaments: Settings[];
  // The tournament every admin page is currently editing (null only if the
  // database has none yet / the migration hasn't been run).
  current: Settings | null;
  loadError: string | null;
  select: (id: string) => void;
  // Re-reads the tournament list (e.g. after renaming one or creating a new
  // one), optionally switching to `selectId`.
  reload: (selectId?: string) => Promise<void>;
}

const Ctx = createContext<AdminTournamentContextValue | null>(null);

export function AdminTournamentProvider({
  initialTournaments,
  initialId,
  initialError,
  children,
}: {
  initialTournaments: Settings[];
  initialId: string | null;
  initialError: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [loadError, setLoadError] = useState<string | null>(initialError);

  const current = useMemo(
    () => tournaments.find((t) => t.id === selectedId) ?? tournaments[0] ?? null,
    [tournaments, selectedId]
  );

  const persist = useCallback(
    (id: string) => {
      setSelectedId(id);
      document.cookie = `${ADMIN_TOURNAMENT_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
      // Server components (the dashboard) read the cookie.
      router.refresh();
    },
    [router]
  );

  const reload = useCallback(
    async (selectId?: string) => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });
      if (error) {
        setLoadError(error.message);
        return;
      }
      setLoadError(null);
      setTournaments((data as Settings[]) ?? []);
      if (selectId) persist(selectId);
    },
    [supabase, persist]
  );

  const value = useMemo(
    () => ({ tournaments, current, loadError, select: persist, reload }),
    [tournaments, current, loadError, persist, reload]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminTournament(): AdminTournamentContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminTournament must be used inside the Admin panel");
  return ctx;
}
