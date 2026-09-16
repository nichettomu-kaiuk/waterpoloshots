# Torneo di Pallanuoto — Web App (template multi-campionato)

App/template per la gestione di uno o più tornei di pallanuoto ("campionati"):
calendario, classifiche in tempo reale, schede squadre/giocatori e un
pannello Admin protetto per gestire partite, risultati, gol e branding — per
ciascun campionato indipendentemente. Costruita con Next.js (App Router) +
Tailwind CSS, dati e auth su Supabase, pronta per il deploy su Vercel.

Il sito è un **template**: da Admin → Campionati puoi creare quanti
campionati vuoi (ognuno con le proprie squadre, partite, giocatori, news e
aspetto grafico) ed eliminarli. La prima pagina del sito pubblico (`/`)
elenca tutti i campionati creati; sceglierne uno porta a `/<indirizzo>/...`
con calendario, classifiche, squadre, ecc. di quel solo campionato.

## 1. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) → **New project**.
2. Apri **SQL Editor** e incolla il contenuto di `supabase/schema.sql`, poi
   esegui. Questo crea tabelle (inclusa `tournaments`, i campionati), RLS, lo
   storage bucket `branding` e un primo campionato con la sua riga
   `settings` (se il progetto Supabase è nuovo; se invece stai aggiornando
   un progetto esistente che girava la versione precedente — a campionato
   singolo — di questo schema, lo stesso file adotta automaticamente i dati
   già presenti nel primo campionato, senza perdere nulla: vedi il blocco
   "MULTI-CAMPIONATO" in fondo al file).
3. Vai su **Authentication → Users → Add user** e crea l'account admin
   (email + password). Non è previsto un flusso di registrazione pubblica:
   solo questo account potrà accedere a `/admin`, da cui gestisce **tutti**
   i campionati.

## 2. Configura le variabili d'ambiente

```bash
cp .env.example .env.local
```

Compila con **Project Settings → API** dal dashboard Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Sviluppo locale

```bash
npm install
npm run dev
```

Apri `http://localhost:3000`: mostra l'elenco campionati (prima pagina del
sito). Il pannello admin è su `/admin` (redirect automatico a
`/admin/login` se non autenticato) — da lì crea/elimina campionati e, per
ciascuno, entra nella sua gestione (`/admin/<indirizzo>/...`).

## 4. Deploy su Vercel

1. Importa il repository su [vercel.com/new](https://vercel.com/new).
2. Aggiungi le stesse due variabili d'ambiente nelle **Project Settings →
   Environment Variables**.
3. Deploy. Vercel rileva Next.js automaticamente (nessuna configurazione
   aggiuntiva richiesta).

## Struttura del progetto

```
app/
  page.tsx                   Elenco campionati — prima pagina del sito
  [slug]/                     Tutto il sito pubblico di UN campionato
    layout.tsx                 Risolve il campionato dallo slug, tema/branding, BottomNav
    page.tsx                    Home (hero, live/upcoming/results)
    calendario/                  Calendario partite (filtri girone + ricerca)
    classifiche/                  Classifica squadre + podio marcatori
    squadre/, squadra/[id]/        Elenco squadre + scheda squadra (rosa giocatori)
    giocatori/, giocatore/[id]/      Elenco giocatori + scheda giocatore
    news/, news/[id]/                Archivio news + dettaglio
  admin/
    login/                      Login Supabase Auth (globale, un solo account)
    page.tsx                    Campionati: crea/elimina campionati
    [slug]/                      Gestione di UN campionato
      layout.tsx                  Risolve il campionato, lo espone via useTournament()
      page.tsx                     Dashboard (metriche di questo campionato)
      matches/                     Calendario + inserimento risultati/gol
      teams/                        CRUD squadre (+ upload logo)
      players/                      CRUD giocatori (+ upload foto)
      venues/                       CRUD campi/piscine
      news/                          CRUD news
      settings/                      Branding di questo campionato: titolo, colori, tema, immagini
components/                  MatchCard, MatchDetailModal, BottomNav, Podium...
lib/
  supabase/                  Client browser/server + middleware auth
  queries.ts                  Query lato server, tutte scoped per tournament_id
  tournament-context.tsx      Contesto React per le pagine admin client-side
supabase/schema.sql          Schema completo (incl. tournaments) + RLS + storage bucket
```

## Note di design

Design system "Championship Dark": sfondo nero (`--color-ink`), rosso vivido
per le azioni (`--color-primary`), oro per podi e risultati top
(`--color-gold`). Tutte le variabili sono CSS custom properties iniettate in
`app/layout.tsx` a partire dalla riga `settings` di Supabase, quindi l'Admin
può ricolorare l'app da `/admin/settings` senza toccare il codice.

## Personalizzazione classifica

Il calcolo dei punti (`lib/queries.ts → getStandings`) usa 3 punti vittoria /
1 pareggio / 0 sconfitta, tipico del calcio; la pallanuoto FIN usa lo stesso
schema in molti tornei giovanili. Se il tuo torneo usa un regolamento diverso
(es. golden goal senza pareggi, o un circuito a punti-tappa), modifica quella
funzione: è isolata e commentata apposta per essere adattata facilmente.
