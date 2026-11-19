# Torneo di Pallanuoto — Web App (template multi-campionato)

App/template per la gestione di **più campionati di pallanuoto** in
parallelo: ogni campionato ha il proprio calendario, classifiche in tempo
reale, schede squadre/giocatori e branding — tutti gestiti da un unico
pannello Admin protetto, che può creare o eliminare campionati in qualsiasi
momento. Costruita con Next.js (App Router) + Tailwind CSS, dati e auth su
Supabase, pronta per il deploy su Vercel.

La prima pagina del sito pubblico (`/`) mostra l'elenco dei campionati
pubblicati; scegliendone uno si entra nel sito di quel campionato
(`/<slug-campionato>/...`).

## 1. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) → **New project**.
2. Apri **SQL Editor** e incolla il contenuto di `supabase/schema.sql`, poi
   esegui. Questo crea tabelle, RLS, lo storage bucket `branding`, la tabella
   `championships` e un primo campionato ("Serie B - Girone 3") con la sua
   riga `settings`. Se il progetto Supabase esisteva già da prima
   dell'introduzione dei campionati, lo stesso script include in fondo la
   migrazione idempotente che crea `championships` e sposta lì tutti i dati
   esistenti (squadre, partite, giocatori, news, impostazioni) come primo
   campionato — nessun dato viene perso.
3. Vai su **Authentication → Users → Add user** e crea l'account admin
   (email + password). Non è previsto un flusso di registrazione pubblica né
   un account per campionato: un solo account amministra tutti i campionati
   da `/admin`.

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

Apri `http://localhost:3000`: mostra l'elenco campionati. Il pannello admin è
su `/admin` (redirect automatico a `/admin/login` se non autenticato) — da lì
si crea/elimina un campionato e si entra nella sua gestione dedicata
(`/admin/<slug>/...`).

## 4. Deploy su Vercel

1. Importa il repository su [vercel.com/new](https://vercel.com/new).
2. Aggiungi le stesse due variabili d'ambiente nelle **Project Settings →
   Environment Variables**.
3. Deploy. Vercel rileva Next.js automaticamente (nessuna configurazione
   aggiuntiva richiesta).

## Struttura del progetto

```
app/
  (site)/page.tsx            Home pubblica: elenco campionati, sceglierne uno
                              porta a /<slug>
  [slug]/                     Sito pubblico di UN campionato (risolto dallo slug)
    page.tsx                    Home campionato (hero, live/upcoming/results)
    calendario/                  Calendario partite (filtri girone + ricerca)
    classifiche/                  Classifica squadre + podio marcatori
    squadra/[id]/                  Scheda squadra (rosa giocatori)
    giocatore/[id]/                 Scheda giocatore
  admin/
    login/                      Login Supabase Auth (globale, non per campionato)
    page.tsx                    Elenco campionati: crea/elimina, apri gestione
    [slug]/                     Gestione di UN campionato
      page.tsx                    Dashboard (metriche)
      matches/                     Calendario + inserimento risultati/gol
      teams/                        CRUD squadre (+ upload logo)
      players/                      CRUD giocatori (+ upload foto)
      venues/                       CRUD campi/piscine
      settings/                     Branding: titolo, colori, immagini, tema
components/                  MatchCard, MatchDetailModal, BottomNav, Podium...
lib/
  supabase/                  Client browser/server + middleware auth
  queries.ts                  Query lato server, tutte scoped a un championship_id
  championship.ts              Risolve lo slug in un campionato (o 404)
  admin-championship-context.tsx  Contesto React col campionato corrente in Admin
supabase/schema.sql          Schema completo + RLS + storage bucket + migrazione
                              idempotente per progetti pre-esistenti
```

Ogni pagina pubblica vive sotto `app/[slug]/...`, quindi ha il proprio "root
layout" Next.js (`app/[slug]/layout.tsx`) — separato da quello della Home
selettore (`app/(site)/layout.tsx`) e da quello dell'Admin
(`app/admin/layout.tsx`). È il pattern "multiple root layouts" di Next.js:
serve perché ogni sezione ha bisogno di classi diverse su `<html>` (il tema
grafico del campionato, sempre Classico in Admin, nessun tema nella Home
selettore).

## Note di design

Design system "Championship Dark": sfondo nero (`--color-ink`), rosso vivido
per le azioni (`--color-primary`), oro per podi e risultati top
(`--color-gold`). Tutte le variabili sono CSS custom properties iniettate in
`app/[slug]/layout.tsx` a partire dalla riga `settings` del campionato
corrente, quindi l'Admin può ricolorare ogni campionato da
`/admin/<slug>/settings` senza toccare il codice.

## Personalizzazione classifica

Il calcolo dei punti (`lib/queries.ts → getStandings`) usa 3 punti vittoria /
1 pareggio / 0 sconfitta, tipico del calcio; la pallanuoto FIN usa lo stesso
schema in molti tornei giovanili. Se il tuo torneo usa un regolamento diverso
(es. golden goal senza pareggi, o un circuito a punti-tappa), modifica quella
funzione: è isolata e commentata apposta per essere adattata facilmente.
