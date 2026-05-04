# SPEC — alignment-scale

Widget di **votazione su scala di allineamento** (stile Mural/FigJam): l'utente esprime
quanto è d'accordo con la frase del titolo posizionando un voto su una scala continua
da **Strongly disagree** a **Strongly agree**, con 5 posizioni discrete (`-2 / -1 / 0 / +1 / +2`).
Il titolo è editabile inline e l'aggregato dei voti è visibile in tempo reale.

## Modello dati

```
AlignmentScale {
  id: string                              # PK, kebab-case
  title: string (max 140, optional)       # se vuoto → placeholder "Add a title—what are you aligning on?"
  createdAt: ISO date
  createdBy: string                       # userId
  totalVotes: number (>= 0)               # cardinalità di Vote[]
  averageValue: number | null             # media dei voti, null se totalVotes === 0
  distribution: Record<VoteValue, number> # numero di voti per ogni step
}

Vote {
  id: string                              # PK
  scaleId: string                         # FK → AlignmentScale.id
  userId: string                          # FK → utente
  value: VoteValue                        # -2 | -1 | 0 | 1 | 2
  createdAt: ISO date
  updatedAt: ISO date
}

VoteValue = -2 | -1 | 0 | 1 | 2

VoteResponse {
  scaleId: string
  myVote: Vote | null
  totalVotes: number
  averageValue: number | null
  distribution: Record<VoteValue, number>
}
```

## Mapping valore ↔ etichetta ↔ colore

| `value` | Etichetta             | Token colore                                | Posizione (% scala) |
| ------- | --------------------- | ------------------------------------------- | ------------------- |
| `-2`    | Strongly disagree     | `--alignment-color-strong-disagree` (red)   | 0%                  |
| `-1`    | Disagree              | `--alignment-color-disagree`        (orange)| 25%                 |
| `0`     | Neutral               | `--alignment-color-neutral`         (yellow)| 50%                 |
| `+1`    | Agree                 | `--alignment-color-agree`           (light green) | 75%           |
| `+2`    | Strongly agree        | `--alignment-color-strong-agree`    (green) | 100%                |

Il **gradiente di sfondo** della scala è continuo da rosso → arancio → giallo → verde chiaro → verde
(token `--alignment-gradient-scale`). I **tick marks** sono 5, posizionati a 0/25/50/75/100%.

## Endpoints

| Metodo | URL                          | Body                  | Risposta                                       |
|--------|------------------------------|-----------------------|------------------------------------------------|
| GET    | /api/alignment/:id           | —                     | `AlignmentScale & { myVote: Vote \| null }`    |
| PATCH  | /api/alignment/:id           | `{ title: string }`   | `AlignmentScale`                               |
| POST   | /api/alignment/:id/vote      | `{ value: VoteValue }`| `VoteResponse`                                 |
| DELETE | /api/alignment/:id/vote      | —                     | `VoteResponse`                                 |

## Stati visivi

### Scala
| Stato            | Quando                                       | Resa                                                            |
|------------------|----------------------------------------------|-----------------------------------------------------------------|
| **empty**        | `totalVotes === 0`                           | "No votes yet" in alto a destra; nessun marker sugli step       |
| **with-votes**   | `totalVotes > 0` && `myVote === null`        | counter "{totalVotes} votes" in alto a destra; bubble di aggregato per ciascuno step con count > 0; nessun marker "tu" |
| **voted**        | `myVote !== null`                            | come `with-votes` + marker grande/animato sullo step `myVote.value` con `aria-label="Il tuo voto: {label}"` |

### Titolo
| Stato            | Quando                                       | Resa                                                            |
|------------------|----------------------------------------------|-----------------------------------------------------------------|
| **placeholder**  | `title` vuoto e non in editing               | testo grigio "Add a title—what are you aligning on?"            |
| **filled**       | `title` valorizzato e non in editing         | testo nero del titolo                                           |
| **editing**      | input in focus                               | input borderless con caret, salva su `blur`/`Enter`             |

### Tick mark (singolo step)
| Stato      | Quando                                | Resa                                            |
|------------|---------------------------------------|-------------------------------------------------|
| `default`  | nessuna interazione                   | tick verticale colorato ~3px×16px               |
| `hover`    | mouseover/focus                       | tick ingrandito + tooltip con etichetta + count |
| `active`   | `myVote.value === step.value`         | cerchio pieno colorato + alone semitrasparente  |
| `busy`     | `busyAction !== null`                 | opacity 0.6, click ignorato                     |

## Regole funzionali

- **R1** — al mount del componente viene chiamato `GET /api/alignment/:id`. Lo stato visuale
  iniziale è `loading` finché la response non arriva.
- **R2** — il **titolo** è editabile via Reactive Forms (`FormControl<string>`); il salvataggio
  è triggerato da:
  - `blur` sull'input,
  - tasto `Enter`,
  - tasto `Escape` (annulla l'edit ripristinando il valore precedente, niente PATCH).
  Validatori: `Validators.maxLength(140)`. Se il titolo è invariato rispetto allo stato
  caricato, **non** viene effettuata la PATCH.
- **R3** — al **click** su un tick (o sull'area cliccabile attorno al tick, larga ≥ 44px per
  raggiungere il target touch) viene effettuata `POST /:id/vote` con `value` corrispondente.
  - Se l'utente non aveva voto → crea il voto.
  - Se aveva voto su step diverso → aggiorna il voto (idempotente lato server).
  - Se aveva voto sullo **stesso** step → effettua `DELETE /:id/vote` (toggle off).
- **R4** — il voto è **ottimistico**: `myVote`, `totalVotes`, `distribution` e `averageValue`
  vengono aggiornati lato client prima della response. In caso di errore HTTP → rollback
  dei 4 campi e messaggio di errore non bloccante.
- **R5** — finché una chiamata di voto è in volo (`busyAction === 'voting'`), ulteriori click
  sui tick sono ignorati. Il salvataggio del titolo (`busyAction === 'saving-title'`) blocca
  invece solo la PATCH del titolo, **non** i voti.
- **R6** — **navigazione tastiera** sulla scala:
  - quando la scala ha focus (`role="slider"`), `ArrowLeft`/`ArrowRight` muovono il "voto candidato" di 1 step;
  - `Home`/`End` saltano a `-2`/`+2`;
  - `Enter` o `Space` confermano il voto candidato (equivalgono al click sul tick);
  - `Delete`/`Backspace` rimuovono il voto corrente se presente.
- **R7** — **hover/focus** su un tick mostra un **tooltip** con etichetta e count
  (es. "Strongly agree · 3 votes") dopo un piccolo delay (≈ 200 ms). Si chiude su
  `mouseleave`/`blur`/`Escape`.
- **R8** — l'**aggregato** mostra una **bubble** sopra ciascuno step con count > 0; la
  dimensione della bubble è proporzionale alla frazione `count / totalVotes` (min 16px, max 28px).
- **R9** — l'indicatore in alto a destra mostra:
  - "No votes yet" se `totalVotes === 0`,
  - "{totalVotes} vote" / "{totalVotes} votes" altrimenti.
  Il valore è derivato da `totalVotes`, mai duplicato in stato locale.
- **R10** — error state della GET di mount: `role="alert"` con bottone "Riprova" che richiama
  l'endpoint. Error state di POST/DELETE/PATCH: toast/banner non bloccante con auto-dismiss
  dopo 5s.
- **R11** — l'aggregato cambia in modo **animato** (transition 150ms) quando arriva un nuovo
  voto. Per ora niente realtime: l'aggiornamento avviene solo in seguito ad azione utente.
- **R12** — l'utente **non può votare** se `scale.title` è vuoto: i tick sono `disabled` e
  il tooltip al hover dice "Aggiungi un titolo prima di votare". Il titolo placeholder non
  conta come valido.
- **R13** — la scala è **read-only** se la prop `readOnly: boolean` è `true` (es. preview o
  vista archiviata): tick non cliccabili, input titolo `readonly`.
- **R14** — il valore di `myVote` viene mostrato in modo persistente anche quando il puntatore
  esce dal tick attivo (alone colorato sotto al tick).
- **R15** — il componente accetta `scaleId` come `@Input() required` (signal input). Se
  `scaleId` cambia → reset stato + nuova GET.

## Accessibilità

- Scala intera: `role="slider"`, `aria-valuemin="-2"`, `aria-valuemax="2"`,
  `aria-valuenow="{myVote?.value ?? 0}"`,
  `aria-valuetext="{labelOf(myVote.value) ?? 'Nessun voto'}"`.
- `aria-labelledby` punta all'`id` dell'input titolo (o di un `<label>` interno se il titolo
  è vuoto): "Scala di allineamento: {title || 'senza titolo'}".
- Ogni tick è anche un `<button>` indipendente focusabile con `aria-label` esplicito
  (es. "Vota Strongly agree, 3 voti"), così la scala è utilizzabile sia come slider sia come
  gruppo di bottoni discreti (doppia modalità: chi preferisce Tab tra i tick e chi preferisce
  arrows sullo slider).
- `<form>` del titolo: `<label class="visually-hidden" for="alignment-title-{id}">Titolo</label>`.
- Stato di caricamento: `<div role="status" aria-live="polite">Caricamento…</div>`.
- Errore di mount: `<div role="alert">…</div>`.
- Tooltip: `role="tooltip"` collegato via `aria-describedby` al tick attivo.
- Focus visibile (`:focus-visible`) su input titolo, scala e ogni tick.
- Contrasto: i colori del gradiente sono usati come **decorazione**; le etichette
  ("Strongly disagree" / "Neutral" / "Strongly agree") restano sempre testuali sotto la scala
  per leggibilità a contrasto AA.
- Riduzione movimento: rispetta `prefers-reduced-motion` disattivando le animazioni di R11.

## Layout & responsive

- Container ≥ 720px: layout come da Figma — titolo a sinistra in alto, "votes counter" a destra
  in alto, scala su tutta la larghezza, etichette sotto a sinistra/centro/destra.
- Container < 720px: scala invariata; il counter scende sotto il titolo; etichette laterali
  rimangono ai bordi, "Neutral" centrale può essere nascosta con `aria-hidden` se troppo stretta.
- Container < 360px: i tick si mantengono a 5 posizioni ma riducono il padding cliccabile a 36px;
  bubble aggregate scalate a 12-22px.

## Token Figma → CSS variable

Dal frame attuale (estrazione Phase 2 della pipeline):

| Ruolo                        | Hex (light) | CSS variable                            |
| ---------------------------- | ----------- | --------------------------------------- |
| Strong disagree              | `#E4572E`   | `--alignment-color-strong-disagree`     |
| Disagree                     | `#F2994A`   | `--alignment-color-disagree`            |
| Neutral                      | `#F2C94C`   | `--alignment-color-neutral`             |
| Agree                        | `#7DCE82`   | `--alignment-color-agree`               |
| Strong agree                 | `#27AE60`   | `--alignment-color-strong-agree`        |
| Gradiente scala              | derivato    | `--alignment-gradient-scale`            |
| Background card              | `#FFFFFF`   | `--alignment-color-card-bg`             |
| Border card                  | `#E5E7EB`   | `--alignment-color-card-border`         |
| Testo titolo placeholder     | `#9CA3AF`   | `--alignment-color-title-placeholder`   |
| Counter testo                | `#6B7280`   | `--alignment-color-counter`             |

Spacing/radius: riusa `--spacing-md`, `--spacing-lg`, `--radius-md` globali. Niente nuovi
token tipografici.

## Edge case

- **Server restituisce `value` fuori range** → ignora il voto, log warning, mostra come `null`.
- **GET ritorna `myVote` ma 0 nella `distribution` per quel value** → ricostruisci la `distribution`
  client-side incrementando di 1 quel value (servire dati incoerenti è un bug del backend ma
  il client deve restare consistente).
- **PATCH titolo durante voto in volo** → ammessa, lock indipendenti.
- **scaleId cambia mentre vote è in volo** → la response del vote vecchio viene ignorata
  (controllo via `scaleId` nella callback).
- **Doppio click rapido sullo stesso tick** → R5 protegge: il primo POST è in volo, il secondo
  è ignorato. Niente flicker.

## Hotspot per implementazione

- Reactive Forms per il titolo: `titleForm: FormGroup<{ title: FormControl<string> }>`.
- Signals per stato:
  - `scale = signal<AlignmentScale | null>(null)`
  - `myVote = signal<Vote | null>(null)`
  - `distribution = signal<Record<VoteValue, number>>({...})`
  - `busyAction = signal<'idle' | 'voting' | 'saving-title'>('idle')`
  - `errorMessage = signal<string | null>(null)`
  - `candidateValue = signal<VoteValue | null>(null)` (per la navigazione keyboard).
- Computed:
  - `totalVotes = computed(() => Object.values(distribution()).reduce((a, b) => a + b, 0))`
  - `hasTitle = computed(() => (scale()?.title ?? '').trim().length > 0)` (R12).
- `(keydown)` su `.alignment-scale__track` con dispatch su `ArrowLeft/Right/Home/End/Enter/Space/Delete`.
- Niente librerie esterne (no Material slider, no librerie tooltip): tooltip e slider custom
  rispettando D6 (var token) e D7 (pattern catalog).

## Esempio mock dataset (per `tools/dev-api.cjs`)

```json
{
  "id": "alignment-demo-1",
  "title": "",
  "createdAt": "2026-04-30T10:00:00Z",
  "createdBy": "user-emilia",
  "myVote": null,
  "totalVotes": 0,
  "averageValue": null,
  "distribution": { "-2": 0, "-1": 0, "0": 0, "1": 0, "2": 0 }
}
```

Dopo `POST /api/alignment/alignment-demo-1/vote { value: 2 }`:

```json
{
  "scaleId": "alignment-demo-1",
  "myVote": { "id": "vote-1", "scaleId": "alignment-demo-1", "userId": "user-emilia", "value": 2, "createdAt": "...", "updatedAt": "..." },
  "totalVotes": 1,
  "averageValue": 2,
  "distribution": { "-2": 0, "-1": 0, "0": 0, "1": 0, "2": 1 }
}
```
