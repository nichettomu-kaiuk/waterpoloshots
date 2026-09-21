"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Card "Esci" nella Panoramica della Dashboard Admin: stessa forma delle
// card statistiche accanto a cui vive, ma esce dalla sessione e riporta al
// sito pubblico del campionato (non a /admin/login, come invece fa il
// pulsante "Esci" di Impostazioni — qui la destinazione è esplicitamente
// il sito pubblico). Deve essere un componente client perché usa il
// client Supabase del browser e window.location.
export default function SignOutCard({ slug }: { slug: string }) {
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    // Hard navigation (non router.push): una navigazione soft subito dopo
    // signOut() può arrivare al controllo del middleware su /admin prima
    // che il cookie di sessione azzerato sia visibile — un caricamento
    // pagina completo vede sempre il cookie aggiornato.
    window.location.href = `/${slug}`;
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-2xl border border-line bg-surface p-4 text-left transition hover:border-primary hover:bg-surface-raised active:scale-[0.99]"
    >
      <LogOut size={18} className="mb-2 text-primary" />
      <p className="font-display text-2xl font-bold">Esci</p>
      <p className="text-xs text-muted">Torna al sito pubblico</p>
    </button>
  );
}
