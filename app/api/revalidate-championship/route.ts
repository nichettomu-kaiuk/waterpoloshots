import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// app/[slug]/layout.tsx (e app/(site)/page.tsx) usano `export const
// revalidate = 15`: le pagine pubbliche sono rigenerate al massimo ogni 15s
// (ISR), non a ogni richiesta — è quello che permette al sito di non
// interrogare Supabase in continuazione. Il rovescio della medaglia: dopo
// aver salvato le Impostazioni (tema, colori, logo, ecc.) da un client
// component con il client Supabase del browser, non c'è nessun meccanismo
// che avvisa Next.js che la cache di quella pagina è ora superata.
//
// Questa route fa da "richiesta" di rigenerazione immediata: va chiamata
// (vedi app/admin/[slug]/settings/page.tsx, handleSave) subito dopo un
// salvataggio riuscito. Nessuna autenticazione: revalidatePath non espone
// né modifica dati, si limita a scartare pagine già in cache pubblica
// perché vengano rigenerate alla prossima visita — nella peggiore delle
// ipotesi, equivale a lasciar scadere naturalmente i 15s.
//
// Perché "/[slug]" (letterale, con le parentesi quadre) e non "/${slug}"
// (il primo tentativo, che NON ha funzionato): revalidatePath(path, type)
// vuole, quando si passa un "type" ('page' | 'layout'), il TEMPLATE di
// route con il segmento dinamico ancora tra parentesi quadre — esattamente
// come appare il nome della cartella (app/[slug]/layout.tsx) — non lo slug
// già risolto. Passare uno slug reale insieme a type:"layout" non
// corrisponde a nessuna route conosciuta e Next.js lo ignora silenziosamente
// (nessun errore, ma nessuna cache viene davvero invalidata: da qui il bug
// "bisogna sempre aggiornare la pagina" anche dopo il fix precedente).
// Il rovescio della medaglia di usare il template invece dello slug
// specifico: invalida il layout (quindi tutte le pagine pubbliche di
// squadre/giocatori/classifiche/ecc.) per TUTTI i campionati, non solo
// quello appena modificato. Per un'app di queste dimensioni è un costo
// trascurabile (un rendering in più al prossimo visitatore di ciascun
// campionato, non un problema visibile), ed è comunque l'unico modo
// documentato e affidabile per invalidare un layout con parametro
// dinamico — molto meglio di un fix che sembra funzionare ma in realtà non
// invalida nulla.
export async function POST() {
  revalidatePath("/[slug]", "layout");
  // Rivalida anche la home del selettore campionati (app/(site)/page.tsx),
  // che mostra branding/elenco campionati con la stessa cache a 15s.
  revalidatePath("/");

  return NextResponse.json({ revalidated: true });
}
