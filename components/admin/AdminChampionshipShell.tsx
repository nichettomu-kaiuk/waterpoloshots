"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChampionshipProvider } from "@/lib/admin-championship-context";
import AdminBottomNav from "@/components/admin/AdminBottomNav";
import type { Championship } from "@/lib/supabase/types";
import type { CSSProperties } from "react";

// La barra di navigazione qui sopra (Dashboard/Partite/Squadre/Giocatori/
// Piscine/News/Impostazioni) è stata rimossa su richiesta esplicita: era
// doppia rispetto ad AdminBottomNav qui sotto, che offre le stesse
// destinazioni in basso. Resta solo l'header con il nome del campionato e
// il link per tornare all'elenco campionati.
export default function AdminChampionshipShell({
  championship,
  hero,
  themeClass,
  brandVars,
  children,
}: {
  championship: Championship;
  hero?: React.ReactNode;
  themeClass: string;
  brandVars: CSSProperties;
  children: React.ReactNode;
}) {
  const base = `/admin/${championship.slug}`;

  return (
    <ChampionshipProvider championship={championship}>
      {/* Unico wrapper con il tema del campionato (colori + classe
          strutturale, da app/admin/[slug]/layout.tsx): avvolge header,
          contenuto e AdminBottomNav, così l'intera sezione Admin segue il
          tema — non più solo Hero come in precedenza. `-mx-4 -my-6 px-4
          py-6` annulla e poi ripristina il padding di app/admin/layout.tsx
          (il layout condiviso, senza tema) sullo stesso div, in modo che lo
          sfondo del tema (rilevante per i temi "-light", che invertono
          --color-ink da scuro a chiaro) copra tutta l'area visibile invece
          di lasciare un bordo scuro tutto intorno. `min-h-screen` copre il
          resto dell'altezza quando il contenuto è più corto della finestra. */}
      <div
        className={`-mx-4 -my-6 min-h-screen px-4 py-6 ${themeClass}`}
        style={{ ...brandVars, backgroundColor: "var(--color-ink)", color: "var(--color-fg)" }}
      >
        <div className="mx-auto w-full max-w-md lg:max-w-5xl xl:max-w-6xl">
          {hero}

          <header className="border-b border-line px-5 py-4 lg:px-8">
            <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-[11px] text-muted hover:text-white">
              <ArrowLeft size={12} /> Tutti i campionati
            </Link>
            <p className="text-[11px] uppercase tracking-widest text-gold">Pannello di controllo</p>
            <h1 className="font-display text-xl font-bold">{championship.name}</h1>
          </header>

          <div className="px-5 pb-24 pt-5 lg:px-8">{children}</div>
        </div>

        <AdminBottomNav base={base} />
      </div>
    </ChampionshipProvider>
  );
}
