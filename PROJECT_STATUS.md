# Waterpolo Shots — Serie B Girone 3 — Riassunto tecnico

Riassunto per riprendere il progetto in una nuova conversazione. Allega lo
zip più recente del progetto (o questo file) come contesto.

## Stack

- **Next.js 14 (App Router)** + TypeScript, **Tailwind CSS**
- **Supabase**: Postgres, Auth (login email/password per l'Admin), Storage
  (bucket `branding` per tutte le immagini caricate)
- Deploy previsto su **Vercel**
- Design system "Championship Dark": nero `--color-ink`, rosso `--color-primary`
  (#e10f21), oro `--color-gold` (#d4af37) — font Oswald (display) + Inter
  (body) + JetBrains Mono (punteggi/numeri in alcuni temi)

## ⚠️ Limite importante di questo ambiente

**Il sandbox di lavoro non ha accesso alla rete npm** (registry.npmjs.org
bloccato) — non è mai stato possibile eseguire `npm install` o `next build`
qui dentro. Ogni modifica è verificata solo con controlli statici (bilancio
parentesi/graffe via script Node, riletture manuali del codice). Il progetto
compila e funziona su Vercel, ma eventuali errori di build vanno segnalati
dall'utente dopo il deploy — non posso verificarli in anticipo.

**Il filesystem del sandbox può resettarsi tra un turno e l'altro.** Prima
di ogni modifica, verificare che `/home/claude/waterpolo-app` esista; se
manca, ripristinarlo da `/mnt/user-data/outputs/waterpolo-tournament-app.zip`
(l'ultimo zip consegnato) con `unzip`.

## File chiave

```
app/
  layout.tsx              Root layout: font, classe tema su <html>, TopRightControls, BottomNav
  page.tsx                 Home (Hero, bento-grid nascosto SHOW_QUICK_NAV=false, News, In corso/Prossimi/Ultimi)
  globals.css               Design tokens + intero sistema temi (vedi sotto)
  calendario/                Calendario partite (girone/giornata, ricerca anche per numero giornata)
  classifiche/                Pagina UNICA "Classifiche" = Classifica squadre + Marcatori (uniti)
  marcatori/                   Redirect verso /classifiche#marcatori (retro-compatibilità link vecchi)
  squadre/, squadra/[id]/        Elenco squadre pubblico + scheda squadra (rosa in 4 colonne: N°/avatar/nome+ruolo/reti)
  giocatori/, giocatore/[id]/     Elenco piatto ordinato per squadra + scheda giocatore (card "player template", frecce prev/next tra compagni di squadra)
  news/, news/[id]/                Archivio News + dettaglio
  admin/
    login/, layout.tsx (nav interna, tema sempre Classico)
    page.tsx                        Dashboard con contatori
    matches/page.tsx                 Elenco partite raggruppato Girone→Giornata, elimina partita/giornata, "Genera calendario di Ritorno"
    matches/[id]/page.tsx             Pagina DEDICATA di modifica partita (vedi sezione Gol sotto)
    teams/, players/, venues/          CRUD con modifica (non solo elimina)
    news/                              CRUD News
    settings/page.tsx                  Branding, colori, tema grafico, Info/Credits

components/
  Hero.tsx                Hero condivisa su TUTTE le pagine pubbliche (logo, titolo, sottotitolo, LiveBadge, social icons)
  BottomNav.tsx             6 voci: Home, Calendario, Classifiche, Squadre, Giocatori, News
  TopRightControls.tsx       Icone fisse in alto a destra: "i" Credits (sempre) + lucchetto Admin (nascosto dentro /admin)
  MatchCard.tsx               Card partita (variant bare per raggruppamenti, ShareButton, TeamLogo)
  MatchDetailModal.tsx          Modal dettaglio (via createPortal — vedi bug fix sotto), marcatori, link diretta
  NewsCard.tsx, Podium.tsx, ShareButton.tsx, LaneRope.tsx

lib/
  queries.ts                Query lato server (getSettings, getStandings, getTopScorers, getTeamWithRoster, ecc.)
  supabase/{client,server,middleware}.ts   Client Supabase (NON tipizzati con generic Database — vedi nota)
  supabase/types.ts          Tutti i tipi: Team, Player, Venue, Match, MatchGoal, Settings, AppTheme

supabase/schema.sql        CREATE TABLE (fresh install) + blocco MIGRAZIONE in fondo (idempotente)
```

## ⚠️ Nota permanente: migrazioni Supabase

`supabase/schema.sql` contiene, in fondo al file, un unico blocco di
migrazione con `alter table ... add column if not exists ...` per ogni
colonna aggiunta nel tempo (giornata, venue_id, logo_large_*, coach_name,
stream_url, player_id nullable, info_*, theme a 6 valori,
match_goals.created_at, ecc.). **È sicuro rieseguire l'intero blocco più
volte.** Buona parte dei bug "non funziona niente" riscontrati in questo
progetto erano in realtà migrazioni non ancora eseguite sul DB live
dell'utente — primo sospetto in caso di comportamento strano.

## Sistema temi (Admin → Impostazioni → Aspetto grafico)

`settings.theme`, 6 valori: `classic`, `lane`, `regulation`,
`classic-light`, `lane-light`, `regulation-light`.

- Applicato come classe sull'elemento `<html>` in `app/layout.tsx`
- CSS a cascata in `globals.css`, targettizzato su **class hook stabili**
  aggiunte nel markup (`site-card`, `match-card`/`match-card-bare`,
  `news-card`, `player-card`, `cap-badge`, `rank-box`, `bottom-nav`,
  `bottom-nav-item`, `hero-eyebrow` — rimossa, causava un bug, vedi sotto —
  `lane-rope`, `corner-icon`, `detail-hero-image`, `podium-pedestal`)
- Le varianti "-light" invertono `--color-ink`/`--color-fg` e forzano
  `.text-white` a diventare scuro tramite `.theme-light` (classe composta
  con le altre tre)
- **Corsia**: card "a biglietto" (clip-path), hero diagonale, punteggi
  monospace, nav a pillola flottante, divisore "corsia" (lane-rope)
- **Regolamento**: card piatte, badge a "cuffia" (ear-tab via `::after`),
  bordo superiore dorato sottile, punteggi tra due trattini
- Pannello Admin resta **sempre Classico** indipendentemente dal tema
  scelto (per leggibilità dello strumento di gestione)

## Modulo Partite/Gol (il più complesso, molto iterato)

- **Giornate/Gironi**: `matches.giornata` (int) + `round_type`
  (`andata`/`ritorno`). "Genera calendario di Ritorno" crea
  automaticamente le partite di ritorno speculari (squadre invertite,
  stessa giornata) per ogni giornata di andata già creata, saltando quelle
  già generate.
- **Modifica partita**: pagina dedicata `/admin/matches/[id]`, non più
  inline nell'elenco. Salvare riporta all'elenco.
- **Punteggio DERIVATO, mai calcolato con +1/-1**: `syncScoreFromGoals()`
  ricontamina `home_score`/`away_score` contando le righe di
  `match_goals` per squadra, ogni volta che si aggiunge/rimuove un gol.
  Questo era il fix decisivo dopo vari bug di disallineamento.
- **Gol con o senza marcatore**: `match_goals.player_id` è nullable (via
  migrazione — controllare sempre che sia stata eseguita). Ogni riga
  giocatore/"senza marcatore" ha pulsanti **+/-** indipendenti; il numero
  mostrato è il conteggio **per quella partita** (non il totale
  stagionale, che vive separatamente in `players.goals_count`).
- **Niente join per leggere i gol**: la select di `match_goals` NON fa più
  embed su `players` (causava fallimenti silenziosi/errori di relazione
  su alcuni progetti Supabase) — i nomi dei marcatori nell'elenco
  "Gol segnati in questa partita" vengono risolti cercando nell'array
  `homeRoster`/`awayRoster` già caricato in memoria.
- **Errori sempre visibili**: `goalError` (banner rosso) mostra qualunque
  fallimento di scrittura/lettura invece di fallire in silenzio — molto
  utile per il debug futuro, tenerlo.
- Eliminazione: singola partita e intera giornata, entrambe con conferma.

## Bug risolti di cui tenere memoria (pattern ricorrenti)

1. **`position: fixed` intrappolato**: contenitori con `overflow-hidden` +
   `transform` (via `animate-rise`) creano un nuovo containing block per i
   figli `position: fixed`, "intrappolandoli" visivamente dentro al
   contenitore invece di coprire tutto lo schermo. Soluzione: `ShareButton`
   e `MatchDetailModal` usano **`createPortal(..., document.body)`**.
   Se si aggiungono nuovi modal/overlay, usare sempre un portal.
2. **`window.open()` per condividere**: non affidabile su mobile con
   parametri `width/height`. `ShareButton` usa `<a href target="_blank">`
   reali invece di `window.open()`.
3. **`background-attachment: fixed`**: inaffidabile su mobile (iOS
   Safari) per il ridimensionamento — rimosso dallo sfondo "Bg home".
4. **Join Supabase embedded**: possono fallire silenziosamente o per
   ambiguità di relazione — se una select con `select("*, rel:table(...)")`
   dà problemi, valutare di separarla in due query o risolvere lato
   client con i dati già in memoria (pattern usato per i gol).
5. **Bordi/linee "misteriose" nei temi**: quasi sempre `::after`/`::before`
   con `flex`+`content:""` che restano visibili anche quando il testo
   accanto è vuoto (es. `hero-eyebrow` quando `active_round` non è
   impostato) — rimosso.

## Cose esplicitamente NON fatte / decisioni prese

- Pannello Admin non segue i temi grafici (resta sempre Classico).
- "Locandina" (poster generato dai dati live) — proposta, poi **annullata
  su richiesta esplicita** dell'utente; nessun residuo di codice.
- Bento-grid in Home nascosto dietro `SHOW_QUICK_NAV = false` in
  `app/page.tsx` — codice presente ma non renderizzato, riattivabile
  cambiando quella riga.

## Come continuare

1. Se richiesta una modifica: verificare presenza progetto, altrimenti
   ripristinare da `/mnt/user-data/outputs/waterpolo-tournament-app.zip`.
2. Dopo ogni modifica: controllo bilancio parentesi via script Node,
   ri-zippare in `/mnt/user-data/outputs/waterpolo-tournament-app.zip`,
   `present_files`.
3. Se la modifica tocca `supabase/schema.sql`, ricordare esplicitamente
   all'utente quale porzione della migrazione eseguire.
4. Se l'utente segnala "non funziona/non succede niente": sospettare per
   primo una migrazione non eseguita o un banner d'errore non letto,
   prima di ipotizzare bug di logica.
