# SPEC — who-to-follow

Sezione di **suggerimento di follow**: presenta una lista di account suggeriti
all'utente, ognuno con un'azione rapida per iniziare/smettere di seguirli.
Hover sul nome dell'account → apre un **tooltip** con i dettagli del profilo.

## Modello dati

```
SuggestedUser {
  id: string                              # PK, kebab-case
  name: string (max 60, required)         # display name (es. "Made by Folk")
  handle: string (max 30, required)       # senza '@' (renderizzato con '@' nel template)
  avatarUrl: string | null                # URL immagine; null → fallback con iniziali
  avatarBg: string                        # CSS color/gradient per il fallback
  isFollowing: boolean                    # stato del follow per l'utente corrente
  isHighlighted: boolean                  # riga in evidenza (banda viola)
  bio: string (max 160, optional)         # mostrata nel tooltip
  followersCount: number (>= 0)           # mostrato nel tooltip
  followingCount: number (>= 0)           # mostrato nel tooltip
  joinedAt: ISO date                      # mostrato nel tooltip ("Iscritto a...")
}

FollowResponse {
  id: string
  isFollowing: boolean
}
```

## Endpoints

| Metodo | URL | Body | Risposta |
|--------|-----|------|----------|
| GET    | /api/who-to-follow                       | —    | SuggestedUser[]    |
| GET    | /api/who-to-follow/:id                   | —    | SuggestedUser      |
| POST   | /api/who-to-follow/:id/follow            | —    | FollowResponse     |
| DELETE | /api/who-to-follow/:id/follow            | —    | FollowResponse     |

## Stati visivi (riga)

| Stato | Quando | Bottone |
|---|---|---|
| **default**     | `isFollowing=false` && `isHighlighted=false` | "Follow" filled black |
| **highlighted** | `isFollowing=false` && `isHighlighted=true`  | "Follow" filled brand purple, riga su banda lavanda |
| **following**   | `isFollowing=true`                            | "Following" outline pill |

## Regole funzionali

- **R1** — la lista è caricata via `GET /api/who-to-follow` al mount del componente.
- **R2** — al click su **"Follow"** (utente con `isFollowing=false`) viene chiamato
  `POST /api/who-to-follow/:id/follow`. Il bottone diventa **"Following"**.
- **R3** — al click su **"Following"** (utente con `isFollowing=true`) viene chiamato
  `DELETE /api/who-to-follow/:id/follow`. Il bottone torna a **"Follow"**.
- **R4** — il toggle è **ottimistico**: lo stato locale cambia subito; in caso di errore
  della chiamata HTTP viene effettuato il **rollback** e mostrato un messaggio di errore.
- **R5** — finché una chiamata di toggle è in volo per un determinato `id`, ulteriori click
  sullo stesso utente sono **ignorati** (debounce per `busyId`).
- **R6** — al massimo **una chiamata di toggle alla volta per utente**; chiamate per utenti
  diversi possono essere concorrenti.
- **R7** — al **hover** (mouseenter) o **focus** sul **nome dell'account** si apre un
  **tooltip** con i dettagli del profilo, dopo un piccolo delay (≈ 300 ms) per evitare aperture
  involontarie. Si chiude al `mouseleave`/`blur` o premendo `Escape`.
- **R8** — il tooltip mostra: avatar grande, nome, handle (`@...`), bio, contatori
  `followersCount` / `followingCount`, data di iscrizione formattata, bottone Follow/Following
  identico a quello della riga.
- **R9** — il tooltip è caricato lazy: alla prima apertura per un dato utente viene chiamato
  `GET /api/who-to-follow/:id` per recuperare bio/contatori; la risposta è cacheata in memoria
  per la durata della sessione.
- **R10** — il tooltip è **accessibile**: il nome utente è un `<button>`/elemento focusabile,
  il tooltip ha `role="tooltip"` e `id` collegato all'`aria-describedby` del trigger.
- **R11** — su touch device (no hover), il tooltip si apre al **tap** sul nome e si chiude
  al tap fuori dal tooltip o sul nome stesso.
- **R12** — il tooltip si posiziona sotto il nome di default; se non c'è spazio sotto, si
  riposiziona sopra. Mai fuori dal viewport orizzontalmente.
- **R13** — empty state: se la response è `[]`, mostra il messaggio "Nessun suggerimento
  al momento.".
- **R14** — error state: se `GET /api/who-to-follow` fallisce, mostra alert con bottone
  "Riprova" che richiama l'endpoint.
- **R15** — la riga **non è cliccabile** nel suo complesso; soltanto il **nome** (apre il
  tooltip) e il **bottone Follow/Following** sono interattivi.
- **R16** — il numero di suggerimenti mostrati è deciso dal backend; la UI non pagina ma
  ne renderizza l'intero array ricevuto.

## Accessibilità

- `<section>` con `aria-labelledby` collegato al titolo `<h2>`.
- Bottoni Follow/Following hanno `aria-label` esplicito (es. "Segui Made by Folk",
  "Smetti di seguire Buzz Usborne").
- Tooltip: `role="tooltip"` + `aria-describedby` sul trigger.
- Stato di caricamento: `role="status"` con `aria-live="polite"`.
- Stato di errore: `role="alert"`.
- Avatar decorativi: `alt=""` (il nome è già nel testo accanto).
- Focus visibile (`:focus-visible`) su tutti gli elementi interattivi.
- `Escape` chiude il tooltip se aperto.
