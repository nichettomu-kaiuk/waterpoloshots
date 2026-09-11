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
migrazione con `alter table ... add/drop column if exists ...` per ogni
colonna aggiunta (o rimossa) nel tempo (giornata, venue_id, coach_name,
stream_url, player_id nullable, info_*, theme a 12 valori,
match_goals.created_at, `teams.logo_large_scale/x/y` rimosse, ecc.). **È
sicuro rieseguire l'intero blocco più volte.** Buona parte dei bug "non
funziona niente" riscontrati in questo progetto erano in realtà migrazioni
non ancora eseguite sul DB live dell'utente — primo sospetto in caso di
comportamento strano.

## Sistema temi (Admin → Impostazioni → Aspetto grafico)

`settings.theme`, **14 valori**: `classic`, `lane`, `regulation`, `impact`,
`broadcast`, `poster`, `tabellone`, e le rispettive varianti `-light`
(`classic-light`, `lane-light`, `regulation-light`, `impact-light`,
`broadcast-light`, `poster-light`, `tabellone-light`).

- Applicato come classe sull'elemento `<html>` in `app/layout.tsx`, via
  `structuralClassMap` (`lane`→`theme-lane`, `regulation`→`theme-regulation`,
  `impact`→`theme-impact`, `broadcast`→`theme-broadcast`,
  `poster`→`theme-poster`, `tabellone`→`theme-tabellone`, `classic`→nessuna
  classe)
- CSS a cascata in `globals.css`, targettizzato su **class hook stabili**
  aggiunte nel markup (`app-hero`, `hero-eyebrow`, `site-card`,
  `match-card`/`match-card-bare`, `match-score`, `news-card`, `player-card`,
  `player-cap-number`, `cap-badge`, `rank-box`, `bottom-nav`,
  `bottom-nav-item`, `lane-rope`, `corner-icon`, `detail-hero-image`,
  `podium-pedestal`) — **nessuna modifica ai componenti .tsx** è mai stata
  necessaria per aggiungere un tema nuovo, switchare tema non richiede mai
  markup diverso
- `hero-eyebrow`: il bug storico era in una regola `::after` legata a
  `active_round` vuoto (rimossa allora); l'hook in sé è vivo e riusato da
  Impact (pallino rosso prima del testo), Broadcast (trattino dorato) e
  Poster (diventa un chip pieno rosso)
- Le varianti "-light" invertono `--color-ink`/`--color-fg` e forzano
  `.text-white` a diventare scuro tramite `.theme-light` (classe composta
  con le altre); Impact/Broadcast/Poster usano `var(--color-*)` ovunque
  proprio per ereditare gratis le varianti chiare, tranne dove il testo sta
  su un blocco pieno oro (`.match-score`/`.player-cap-number` in Poster) —
  lì il colore testo è **hardcoded `#0a0a0b`** invece di `var(--color-ink)`,
  perché `--color-ink` si inverte in bianco nelle varianti "-light" e
  renderebbe il testo illeggibile sopra l'oro
- **Nessun evidenziamento delle prime 3 posizioni** in `.rank-box` (pagina
  Classifiche): rimosso esplicitamente su richiesta dell'utente — se in
  futuro si volesse un accento pos. 1-3, ricordarsi di questa scelta prima
  di riproporlo
- **Nessuna cornice sul numero di posizione in classifica** (`.rank-box
  span`) in Onda d'Urto e Poster Arena: Onda d'Urto non ne ha mai avuta
  (solo numero mono), in Poster Arena è stato tolto il `border: 2px solid
  var(--color-fg)` su richiesta esplicita — il numero resta un semplice
  testo monospace senza riquadro
- **Corsia**: card "a biglietto" (clip-path), hero diagonale, punteggi
  monospace, nav a pillola flottante, divisore "corsia" (lane-rope)
- **Regolamento**: card piatte, badge a "cuffia" (ear-tab via `::after`),
  bordo superiore dorato sottile, punteggi tra due trattini
- **Onda d'Urto** (`impact`): hero con wash diagonale rosso + striscia
  "ticker" decorativa in fondo, card a biglietto con taglio più profondo e
  bordo oro più spesso (rosso se live), punteggi/reti con testo a gradiente
  rosso→oro (`background-clip: text`), nav a pillola con gradiente
  rosso→oro sull'attivo, **loghi squadra/foto giocatore senza cornice**
  (`.cap-badge` a `border-width: 0`, tolta su richiesta esplicita)
- **Broadcast Gold** (`broadcast`): estetica da grafica TV — hairline dorate
  sottili, card "vetro" (leggera tinta `color-mix` sul fondo + bordo oro
  translucido), punteggi/numero maglia mono affiancati da trattini corti
  dorati, nav con sottolineatura dorata sull'attivo invece del pallino
- **Poster Arena** (`poster`): manifesto grafico — zero angoli arrotondati
  ovunque (`!important` sugli hook), bordi spessi 2px su card/testo, badge
  squadra/giocatore **quadrati e senza cornice** (`.cap-badge` a
  `border-width: 0`, tolta su richiesta esplicita — resta solo l'angolo
  vivo dato dal `border-radius: 0`), lettera "W" gigante in outline dietro
  l'hero (`::before`, clippata dall'`overflow-hidden` esistente), punteggi/
  numero maglia come blocco pieno oro, nav rettangolare
  con divisori verticali e attivo = blocco rosso pieno
- **Tabellone** (`tabellone`): nato dalla revisione grafica a due direzioni
  condivisa dall'utente su un canvas Claude Design ("Waterpolo Serie B - UI
  Mockups"), che confrontava due proposte ("Turno 1"/"Turno 2"). L'utente ha
  scelto **Turno 2** (rosso/oro, Space Grotesk). **Turno 1** ("Broadsheet":
  serif Source Serif 4, palette teal/magenta/giallo che richiama la stampa
  CMYK, effetto "lastre di stampa disallineate" con `feColorMatrix` SVG +
  script JS di tracking del puntatore + markup con copie multiple dello
  stesso testo per elemento) è stato **scartato deliberatamente**: avrebbe
  richiesto un nuovo file JS e struttura markup dedicata, violando la regola
  di questo progetto per cui cambiare tema non deve mai richiedere markup
  diverso nei componenti. Turno 2 invece è puro CSS sugli hook esistenti,
  stesso identico pattern di tutti gli altri temi.
  - Font Space Grotesk (`@import` in cima a `globals.css`, applicato via
    `.theme-tabellone .font-display`), angoli quasi squadrati (`border-radius:
    6px` invece di 0 come Poster o pieno come Corsia), punteggi/numero
    maglia in stile monospaziato tabellone.
  - **ECCEZIONE DELIBERATA — podio in classifica**: Tabellone è l'UNICO tema
    che evidenzia le prime 3 posizioni in `.rank-box` (1°/2° = blocco rosso
    pieno, 3° = tinta oro tenue con testo `#0a0a0b` hardcoded per lo stesso
    motivo di contrasto già documentato per Poster). Questo era stato
    esplicitamente rimosso da TUTTI gli altri temi su richiesta dell'utente
    in una fase precedente del progetto — qui viene volutamente reintrodotto
    come caratteristica distintiva di questo solo tema, seguendo lo stesso
    principio già usato per i badge quadrati di Poster Arena ("ogni tema può
    introdurre un trattamento nuovo"). Non toccare gli altri temi.
- Pannello Admin resta **sempre Classico** indipendentemente dal tema
  scelto (per leggibilità dello strumento di gestione)
- Migrazione `settings_theme_check` estesa più volte sul progetto Supabase
  live (`vjcvmlapgmlvuqldwzyy`) — l'ultima volta per aggiungere `tabellone`/
  `tabellone-light`; il blocco è comunque in `supabase/schema.sql`
  (idempotente) per chi clona il progetto da zero o lavora su un altro DB.
- ⚠️ **Scoperta durante l'aggiunta di Tabellone**: il vincolo `theme` sul
  database Supabase LIVE conteneva già due valori — `'magazine'` e
  `'magazine-light'` — che NON esistono da nessuna parte in questa copia del
  progetto (nessun CSS in `globals.css`, nessuna voce nel picker di
  `app/admin/settings/page.tsx`, nessun valore nel tipo `AppTheme` prima di
  questa modifica). La riga `settings` live aveva infatti `theme =
  'magazine-light'` impostato. Questo indica che il sito effettivamente
  deployato (su Vercel) sta girando una versione del codice **diversa/più
  recente** di questo zip, con un tema "Magazine" implementato altrove.
  Per non rompere la scelta attuale dell'utente sul sito live, non ho
  rimosso questi due valori dal vincolo (l'ho esteso, non sostituito) e li
  ho aggiunti anche al tipo `AppTheme` con una nota esplicativa — ma
  **questa copia del progetto non contiene il CSS del tema Magazine**: se
  viene ridistribuita (deploy) sopra al sito attuale, il tema "Magazine"
  selezionato smetterà di avere il suo stile e la pagina ricadrà
  sostanzialmente su Classico chiaro (nessuna classe strutturale
  corrispondente + variante `-light`). Prima di ri-deployare questo zip,
  consigliare all'utente di: (a) fornire il codice del tema Magazine
  attualmente live così da poterlo reintegrare qui, oppure (b) selezionare
  manualmente un tema noto (es. Classico) da Admin → Impostazioni prima del
  deploy, per evitare un cambio di aspetto a sorpresa.

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
   Nota di layout (non un bug, ma cambiato su richiesta esplicita): sia il
   modal Credits (`TopRightControls`) sia `MatchDetailModal` sono passati da
   "bottom sheet" (`items-end`, `rounded-t-3xl`, `border-t`) a finestra
   **centrata** (`items-center` + `p-4` sul contenitore, `rounded-3xl` +
   `border` sul pannello). `ShareButton` resta volutamente un bottom sheet
   (non toccato) — se in futuro si vuole coerenza totale, ricordarsi che
   quello è l'unico rimasto ancorato in basso.
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
- `/admin/venues/page.tsx` (Piscine): aggiunta la modifica in linea (icona
  matita accanto al cestino), stesso pattern già usato in
  `/admin/teams/page.tsx` — `editingId`/`startEdit`/`cancelEdit`, form che
  fa `update` invece di `insert` quando si è in modifica, banner "Modifica
  piscina" con pulsante Annulla. Prima esisteva solo aggiunta ed
  eliminazione.
- "Locandina" (poster generato dai dati live) — proposta, poi **annullata
  su richiesta esplicita** dell'utente; nessun residuo di codice.
- `app/giocatore/[id]/page.tsx`: rimosso il watermark col logo squadra in
  grande dietro la foto del giocatore (era il `<div>` assoluto con
  `backgroundImage: team.logo_url`, opacity 0.15, posizionato/scalato via
  `logo_large_scale/x/y`) — su richiesta esplicita. Lo sfondo del riquadro
  torna semplicemente `bg-ink` pieno.
- `/admin/teams/page.tsx`: rimossi anche i controlli admin diventati inutili
  dopo la modifica sopra — pannello "Logo grande — scheda giocatore" con
  anteprima e slider dimensione/posizione X/Y, i relativi state
  (`logoScale`/`logoX`/`logoY`/`editingLogoUrl`) e il salvataggio di
  `logo_large_scale/x/y` in `handleSubmit` — su richiesta esplicita.
- Le colonne `teams.logo_large_scale/x/y` sono state **eliminate anche dal
  database** (su richiesta esplicita, come step successivo alla rimozione
  UI sopra): migrazione applicata live via MCP Supabase (progetto
  `vjcvmlapgmlvuqldwzyy`, `alter table teams drop column ...`, verificata
  con `information_schema.columns`), `supabase/schema.sql` aggiornato
  (rimosse dalla `CREATE TABLE` e il blocco add-column in fondo sostituito
  con un blocco drop-column idempotente), e il tipo `Team` in
  `lib/supabase/types.ts` non le elenca più.
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
