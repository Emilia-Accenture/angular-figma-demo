# SPEC — tic-tac-toe

Gioco classico **Tic-Tac-Toe** (filetto / tris) su griglia **3×3** per **due giocatori
locali** (hot-seat) che si alternano sullo stesso device. Il giocatore `X` muove sempre
per primo. La partita finisce quando un giocatore allinea 3 simboli in orizzontale,
verticale o diagonale, oppure quando tutte e 9 le celle sono occupate (pareggio).
Il componente mostra anche uno **scoreboard cumulativo** delle partite giocate nella
sessione corrente e consente di **resettare** la partita in qualunque momento.

## Modello dati

```
CellValue = 'X' | 'O' | null
Player    = 'X' | 'O'
GameStatus = 'in-progress' | 'won' | 'draw'

Cell {
  index: 0..8                              # 0-based, riga-major (top-left = 0, bottom-right = 8)
  row: 0..2                                # index = row * 3 + col
  col: 0..2
  value: CellValue
}

Board = readonly Cell[9]                   # length === 9, ordine fisso

WinningLine {
  cells: [number, number, number]          # gli indici della riga vincente
  player: Player                           # chi ha vinto
}

Game {
  id: string                                # PK, kebab-case (es. "tic-demo-1")
  board: Board
  currentPlayer: Player                     # chi deve muovere
  moveCount: number (0..9)                  # cardinalità delle celle non-null
  status: GameStatus
  winningLine: WinningLine | null           # null finché status !== 'won'
  startedAt: ISO date
  finishedAt: ISO date | null
  history: Move[]                           # cronologia ordinata cronologicamente
}

Move {
  index: number                             # 0..8, cella mossa
  player: Player
  at: ISO date
}

Score {
  X: number                                 # >= 0
  O: number                                 # >= 0
  draw: number                              # >= 0
}

GameSession {
  game: Game
  score: Score                              # cumulativo della sessione (gameId costante)
}
```

## Costanti & ID di gioco

```
WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],          # righe
  [0, 3, 6], [1, 4, 7], [2, 5, 8],          # colonne
  [0, 4, 8], [2, 4, 6],                     # diagonali
]
```

8 linee vincenti totali. Costanti centralizzate in `tic-tac-toe.constants.ts`.

## Endpoints

Il componente è giocabile **anche offline**: lo stato è gestito client-side. La sincronizzazione
con il server è opzionale ed è usata per persistenza/condivisione partita.

| Metodo | URL                                 | Body                        | Risposta                           |
|--------|-------------------------------------|-----------------------------|------------------------------------|
| GET    | /api/tic-tac-toe/:id                | —                           | `GameSession`                      |
| POST   | /api/tic-tac-toe/:id/move           | `{ index: 0..8 }`           | `GameSession`                      |
| POST   | /api/tic-tac-toe/:id/reset          | —                           | `GameSession` (game azzerato, score invariato) |
| DELETE | /api/tic-tac-toe/:id                | —                           | `204 No Content`                   |

Il server **valida**:
- `index` ∈ `0..8` e `board[index] === null` (cella libera).
- `status === 'in-progress'` per accettare la mossa.
- Il `currentPlayer` è quello atteso (turni alternati).

## Stati visivi

### Game

| Stato         | Quando                                       | Resa                                                                                  |
|---------------|----------------------------------------------|---------------------------------------------------------------------------------------|
| `loading`     | mount, prima della GET (se persistenza on)   | placeholder griglia con `role="status"`                                               |
| `in-progress` | `status === 'in-progress'`                   | griglia interattiva, indicatore "Turno: X" o "Turno: O"                               |
| `won`         | `status === 'won'`                           | griglia non interattiva; 3 celle della `winningLine` evidenziate; banner "Vince {player}!" |
| `draw`        | `status === 'draw'`                          | griglia non interattiva; banner "Pareggio"                                            |
| `error`       | GET/POST falliscono                          | banner `role="alert"` + bottone "Riprova"                                             |

### Cella (singola)

| Stato       | Quando                                            | Resa                                                       |
|-------------|---------------------------------------------------|------------------------------------------------------------|
| `empty`     | `value === null` && `status === 'in-progress'`    | cella vuota, hover mostra preview (player corrente, opacity 0.3) |
| `filled`    | `value !== null`                                  | simbolo X o O nero, peso 600                               |
| `winning`   | l'indice è in `winningLine.cells`                  | sfondo verde tenue, simbolo enfatizzato (scale 1.05)        |
| `disabled`  | `status !== 'in-progress'` || `value !== null`     | cursor not-allowed, click ignorato, no preview              |
| `last-move` | l'indice corrisponde a `history.at(-1).index`      | bordo sottile evidenziato per 600ms post-mossa              |

### Scoreboard

| Stato       | Quando                                            | Resa                                                       |
|-------------|---------------------------------------------------|------------------------------------------------------------|
| `idle`      | sempre                                            | 3 colonne: `X: n`, `O: n`, `Pareggi: n`                    |
| `bumping`   | una delle tre cifre è appena cambiata             | scale 1.15 per 200ms con transition                         |

## Regole funzionali

- **R1** — Al mount, se `gameId` è valorizzato, GET `/api/tic-tac-toe/:id` per ripristinare
  partita + score. Se la GET fallisce con 404, viene **creato** uno stato locale
  vergine (board vuota, `currentPlayer = 'X'`, `score = { X: 0, O: 0, draw: 0 }`)
  senza POST automatica al server.

- **R2** — Click su cella libera con `status === 'in-progress'`:
  - aggiorna `board[index] = currentPlayer`,
  - incrementa `moveCount`,
  - aggiunge un `Move` a `history`,
  - alterna `currentPlayer` (`X → O` o `O → X`).
  Tutto è fatto **lato client** in modo ottimistico; in parallelo viene chiamata
  POST `/api/tic-tac-toe/:id/move`. In caso di errore HTTP → rollback dell'intera mossa
  + toast non bloccante.

- **R3** — Subito dopo ogni mossa, viene calcolata la **detection di vittoria**:
  - per ogni linea in `WIN_LINES`, se i tre `value` sono uguali e non null → `status = 'won'`,
    `winningLine = { cells, player }`, `finishedAt = ISO now`.
  - se `moveCount === 9` e nessuna linea vincente → `status = 'draw'`, `finishedAt = ISO now`.
  Nessun ulteriore click viene accettato finché non si reset.

- **R4** — Allo `status` finale (`won`/`draw`):
  - se `won` → incrementa `score[winningLine.player]`,
  - se `draw` → incrementa `score.draw`.
  L'aggiornamento dello scoreboard è animato (R10).

- **R5** — Bottone **"Reset"** (sempre visibile) → reset della board e `currentPlayer = 'X'`,
  **mantiene** `score`, **azzera** `history`, `winningLine`, `finishedAt`. Se persistenza on,
  POST `/api/tic-tac-toe/:id/reset`.

- **R6** — Bottone **"Nuova sessione"** (visibile solo a partita finita) → reset board
  **+ score**. Se persistenza on, DELETE `/api/tic-tac-toe/:id` poi GET (o creazione locale).

- **R7** — `gameId` come `@Input()` signal opzionale. Se assente, il componente lavora in
  modalità **locale-only** (niente HTTP). Se cambia → R1 ripartito.

- **R8** — Indicatore di **turno**: testo `"Turno: X"` / `"Turno: O"` sopra la griglia;
  durante `won` mostra `"Vince {player}!"`; durante `draw` mostra `"Pareggio"`.

- **R9** — **Click ottimistico ignorato** se:
  - `status !== 'in-progress'` (partita finita / loading),
  - `cell.value !== null` (cella già occupata),
  - `busy === true` (POST in volo della mossa precedente, R2).

- **R10** — **Animazioni**:
  - mossa: simbolo appare con `transform: scale(0.6 → 1)` in 150ms,
  - winning line: sfondo cella verde con transition 250ms,
  - score bump: cifra cambiata `transform: scale(1 → 1.15 → 1)` in 200ms,
  - last-move highlight: bordo cella visibile per 600ms.
  Rispetta `prefers-reduced-motion: reduce` → tutte le animazioni disabilitate.

- **R11** — **Navigazione tastiera**:
  - la griglia è un `role="grid"` con 9 celle `role="gridcell"`,
  - `ArrowUp/Down/Left/Right` muovono il focus nella direzione corrispondente con
    **clamp** ai bordi (no wrap-around),
  - `Home` → cella 0, `End` → cella 8,
  - `Enter`/`Space` → mossa equivalente a click R2,
  - durante `won`/`draw` arrows continuano a navigare (per leggere il board) ma
    Enter/Space non muovono nulla.

- **R12** — **Hover preview**: su cella `empty` durante `in-progress`, mouse hover/focus
  mostra il simbolo del `currentPlayer` con opacity 0.3. Si chiude su mouseleave/blur.
  Disattivato su touch (`@media (hover: none)`).

- **R13** — **Persistenza HTTP optimistic**:
  - rollback completo in caso di errore (`board`, `currentPlayer`, `moveCount`, `history`).
  - toast non bloccante "Mossa non salvata. Riprova."
  - retry **manuale** (no retry automatica): l'utente clicca di nuovo.

- **R14** — **Read-only mode**: prop `readOnly: boolean = false`. Se `true` (es. preview
  archiviata) la griglia è non interattiva e nessun bottone di azione è visibile.

- **R15** — **`@Input() startingPlayer: Player = 'X'`** — opzionale. Permette di iniziare
  con O. Default `'X'`. Cambia solo al reset, non durante una partita.

## Accessibilità

- Container: `role="region"`, `aria-label="Tic-tac-toe"`.
- Indicatore turno: `<div role="status" aria-live="polite">Turno: X</div>`. Il cambio
  di turno è annunciato dagli screen reader.
- Griglia: `<div role="grid" aria-rowcount="3" aria-colcount="3">`.
- Cella: `<button role="gridcell" aria-rowindex="{r+1}" aria-colindex="{c+1}"
  aria-label="Riga {r+1} colonna {c+1}, {value || 'vuota'}">`.
- Cella vincente: aggiunta `aria-label`-suffix `", parte della linea vincente"`.
- Banner finale: `<div role="alert" aria-live="assertive">Vince X!</div>` o
  `Pareggio`.
- Toast errore: `<div role="status" aria-live="polite">` con auto-dismiss 5s.
- `:focus-visible` evidente su ogni cella (outline 2px del colore primario) e sui bottoni
  Reset / Nuova sessione.
- Reduced motion: tutte le transizioni disattivate (R10).
- Contrasto: simbolo X/O **nero `#000000`** su sfondo bianco → contrasto AA garantito.
  Linea vincente: sfondo verde tenue + simbolo non perde leggibilità (verde usato come
  decorazione, non come carrier informativo unico — il banner testuale è autoritativo).

## Layout & responsive

- Container ≥ 480px: griglia centrata con larghezza ~480px, header (turno) sopra,
  scoreboard + bottoni sotto in riga.
- Container 360-480px: griglia full-width fino a max 100% del padre, scoreboard e bottoni
  sotto in colonna su 2 righe.
- Container < 360px: griglia full-width, font dei simboli ridotto, padding interno celle a
  `--spacing-sm`.

Aspect-ratio della board: **1:1** sempre (CSS `aspect-ratio: 1 / 1` sul wrapper).

## Token Figma → CSS variable

Dal frame attuale (estrazione Phase 2 della pipeline):

| Ruolo                               | Hex (light) | CSS variable                            |
| ----------------------------------- | ----------- | --------------------------------------- |
| Frame esterno (bordo + padding)     | `#2196F3`   | `--ttt-color-frame`                     |
| Cella sfondo                        | `#FFFFFF`   | `--ttt-color-cell-bg`                   |
| Cella sfondo hover                  | `#F5FAFF`   | `--ttt-color-cell-bg-hover`             |
| Cella sfondo winning                | `#D1FADF`   | `--ttt-color-cell-bg-winning`           |
| Bordo cella subtle                  | `#E5E7EB`   | `--ttt-color-cell-border`               |
| Simbolo X / O                       | `#111827`   | `--ttt-color-symbol`                    |
| Simbolo preview hover               | `rgba(17,24,39,0.30)` | `--ttt-color-symbol-preview` (alpha) |
| Testo turno / scoreboard            | `#374151`   | `--ttt-color-text`                      |
| Testo banner vittoria               | `#065F46`   | `--ttt-color-banner-win`                |
| Testo banner pareggio               | `#6B7280`   | `--ttt-color-banner-draw`               |
| Bordo last-move highlight           | `#2196F3`   | `--ttt-color-last-move`                 |

Spacing/radius:
- `--ttt-frame-padding`: `var(--spacing-md)` (gap fra celle).
- `--ttt-cell-radius`: `var(--radius-md)` (8px).
- `--ttt-frame-radius`: `var(--radius-lg)` (12px).
- `--ttt-symbol-size`: `clamp(2rem, 8vw, 3.5rem)` (responsive font-size del simbolo).

Niente nuovi token tipografici (riusa `--font-family-base`).

## Edge case

- **Click rapidissimo prima del rendering del simbolo** → R9 protegge: `busy` durante POST.
- **Server restituisce `board` con celle multiple per turno (incoerenza)** → ignora il
  payload, log warning, mantiene lo stato client; toast "Stato server incoerente, sincro disabilitata".
- **Reset durante POST in volo** → la response del POST in volo viene ignorata
  (controllo via `gameId + moveCount` snapshot).
- **`gameId` cambia durante POST in volo** → response del POST vecchio ignorata.
- **`startingPlayer` cambia mid-game** → cambia solo al prossimo reset (R15).
- **Hover preview su cella che diventa occupata mentre il mouse è dentro** → hide preview
  immediatamente (computed: preview visibile solo se `value === null`).
- **Tastiera: cella in focus che diventa winning** → mantieni focus, l'utente continua
  a navigare (R11).

## Hotspot per implementazione

- Stato signals:
  - `board = signal<Board>(createEmptyBoard())`
  - `currentPlayer = signal<Player>(this.startingPlayer())`
  - `history = signal<Move[]>([])`
  - `score = signal<Score>({ X: 0, O: 0, draw: 0 })`
  - `busy = signal<boolean>(false)`
  - `errorMessage = signal<string | null>(null)`
  - `loadState = signal<'loading' | 'success' | 'error'>('success')`
  - `lastMoveIndex = signal<number | null>(null)`
  - `focusedIndex = signal<number>(0)` (per R11 keyboard).
- Computed:
  - `moveCount = computed(() => history().length)`
  - `winningLine = computed(() => detectWin(board()))` (pure function su `WIN_LINES`).
  - `status = computed<GameStatus>(() => winningLine() ? 'won' : moveCount() === 9 ? 'draw' : 'in-progress')`
  - `turnLabel = computed(() => status() === 'won' ? \`Vince ${winningLine()!.player}!\` : status() === 'draw' ? 'Pareggio' : \`Turno: ${currentPlayer()}\`)`
- `effect()` su `gameId` (con `allowSignalWrites: true`): reset stato + GET (se gameId).
- `effect()` su `status` con `allowSignalWrites: true`: quando passa a `won`/`draw`,
  incrementa lo `score`. Usare un `previousStatus` cache per evitare doppio incremento.
- Niente Reactive Forms (D2 si applica a input utente: qui non ce n'è — i click sono
  azioni, non input).
- Niente librerie esterne (no Material, no animation lib): tutte transizioni in SCSS.
- Mock backend in `tools/dev-api.cjs` con marker block `feature:tic-tac-toe`,
  store in-memory `Map<gameId, GameSession>`.

## Esempio mock dataset (per `tools/dev-api.cjs`)

Stato iniziale dopo creazione/`reset`:

```json
{
  "game": {
    "id": "tic-demo-1",
    "board": [null, null, null, null, null, null, null, null, null],
    "currentPlayer": "X",
    "moveCount": 0,
    "status": "in-progress",
    "winningLine": null,
    "startedAt": "2026-04-30T10:00:00Z",
    "finishedAt": null,
    "history": []
  },
  "score": { "X": 0, "O": 0, "draw": 0 }
}
```

Dopo `POST /api/tic-tac-toe/tic-demo-1/move { index: 4 }` (X centro):

```json
{
  "game": {
    "id": "tic-demo-1",
    "board": [null, null, null, null, "X", null, null, null, null],
    "currentPlayer": "O",
    "moveCount": 1,
    "status": "in-progress",
    "winningLine": null,
    "startedAt": "2026-04-30T10:00:00Z",
    "finishedAt": null,
    "history": [{ "index": 4, "player": "X", "at": "2026-04-30T10:00:05Z" }]
  },
  "score": { "X": 0, "O": 0, "draw": 0 }
}
```

Stato post-vittoria (riga superiore: indici 0,1,2 tutti X):

```json
{
  "game": {
    "id": "tic-demo-1",
    "board": ["X", "X", "X", "O", "O", null, null, null, null],
    "currentPlayer": "O",
    "moveCount": 5,
    "status": "won",
    "winningLine": { "cells": [0, 1, 2], "player": "X" },
    "startedAt": "2026-04-30T10:00:00Z",
    "finishedAt": "2026-04-30T10:01:30Z",
    "history": [
      { "index": 0, "player": "X", "at": "..." },
      { "index": 3, "player": "O", "at": "..." },
      { "index": 1, "player": "X", "at": "..." },
      { "index": 4, "player": "O", "at": "..." },
      { "index": 2, "player": "X", "at": "..." }
    ]
  },
  "score": { "X": 1, "O": 0, "draw": 0 }
}
```
