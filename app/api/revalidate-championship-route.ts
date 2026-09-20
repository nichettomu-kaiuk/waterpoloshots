import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// app/[slug]/layout.tsx (e app/(site)/page.tsx) usano `export const
// revalidate = 15`: le pagine pubbliche sono rigenerate al massimo ogni 15s
// (ISR), non a ogni richiesta — è quello che permette al sito di non
// interrogare Supabase in continuazione. Il rovescio della medaglia: dopo
// aver salvato le Impostazioni (tema, colori, logo, ecc.) da un client
// component con il client Supabase del browser, non c'è nessun meccanismo
// che avvisa Next.js che la cache di quella pagina è ora superata — restava
// quella vecchia fino allo scadere dei 15s (e anche oltre, per via dello
// stale-while-revalidate: la richiesta successiva alla scadenza mostra
// ancora la versione vecchia, rigenerandola solo per quella dopo). Da qui il
// bug segnalato: cambiare tema e salvare, poi tornare subito al sito,
// mostrava ancora il tema precedente finché non si ricaricava la pagina a
// mano.
//
// Questa route fa da "richiesta" di rigenerazione immediata: va chiamata
// (vedi app/admin/[slug]/settings/page.tsx, handleSave) subito dopo un
// salvataggio riuscito, passando lo slug appena aggiornato. Nessuna
// autenticazione: revalidatePath non espone né modifica dati, si limita a
// scartare una pagina già in cache pubblica perché venga rigenerata alla
// prossima visita — comportamento identico, nella peggiore delle ipotesi,
// a lasciar scadere naturalmente i 15s.
export async function POST(request: NextRequest) {
  let body: { slug?: unknown; previousSlug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON non valido" }, { status: 400 });
  }

  const { slug, previousSlug } = body;
  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "slug mancante" }, { status: 400 });
  }

  // "layout" invalida l'intero sottoalbero app/[slug]/** (home, classifiche,
  // squadre, giocatori, news, ecc.), non solo la pagina home di quel
  // campionato.
  revalidatePath(`/${slug}`, "layout");
  if (typeof previousSlug === "string" && previousSlug && previousSlug !== slug) {
    revalidatePath(`/${previousSlug}`, "layout");
  }

  return NextResponse.json({ revalidated: true });
}
