# Torneo di Pallanuoto — Web App

App per la gestione di tornei di pallanuoto: calendario, classifiche in tempo
reale, schede squadre/giocatori e un pannello Admin protetto per gestire
partite, risultati, gol e branding. Costruita con Next.js (App Router) +
Tailwind CSS, dati e auth su Supabase, pronta per il deploy su Vercel.

## 1. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) → **New project**.
2. Apri **SQL Editor** e incolla il contenuto di `supabase/schema.sql`, poi
   esegui. Questo crea tabelle, RLS, lo storage bucket `branding` e una riga
   iniziale in `settings`.
3. Vai su **Authentication → Users → Add user** e crea l'account admin
   (email + password). Non è previsto un flusso di registrazione pubblica:
   solo questo account potrà accedere a `/admin`.

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

Apri `http://localhost:3000`. Il pannello admin è su `/admin` (redirect
automatico a `/admin/login` se non autenticato).

## 4. Deploy su Vercel

1. Importa il repository su [vercel.com/new](https://vercel.com/new).
2. Aggiungi le stesse due variabili d'ambiente nelle **Project Settings →
   Environment Variables**.
3. Deploy. Vercel rileva Next.js automaticamente (nessuna configurazione
   aggiuntiva richiesta).

## Struttura del progetto

```
app/
  page.tsx                  Home (hero, bento grid, live/upcoming/results)
  calendario/                Calendario partite (filtri girone + ricerca)
  classifiche/                Classifica squadre + podio marcatori
  squadra/[id]/                Scheda squadra (rosa giocatori)
  giocatore/[id]/               Scheda giocatore
  admin/
    login/                      Login Supabase Auth
    page.tsx                    Dashboard (metriche)
    matches/                    Calendario + inserimento risultati/gol
    teams/                       CRUD squadre (+ upload logo)
    players/                     CRUD giocatori (+ upload foto)
    venues/                      CRUD campi/piscine
    settings/                    Branding: titolo, colori, immagini
components/                  MatchCard, MatchDetailModal, BottomNav, Podium...
lib/
  supabase/                  Client browser/server + middleware auth
  queries.ts                  Query lato server (classifiche calcolate live)
supabase/schema.sql          Schema completo + RLS + storage bucket
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
