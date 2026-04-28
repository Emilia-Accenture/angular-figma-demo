# angular-figma-demo

> Demo Angular 17+ che genera componenti standalone da screenshot/Figma tramite la pipeline `/figma-pipeline` orchestrata da [Claude Code](https://claude.com/claude-code).

L'app espone una home dashboard che visualizza in tempo reale lo stato della pipeline a 9 fasi e una preview live dei componenti generati. Tutta la "intelligenza" — agenti, skill, pattern — vive in [`.claude/`](.claude/), versionata insieme al codice.

## Stack

- **Angular 17** standalone components, no `@NgModule`
- **TypeScript** stretto (`strict: true`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`)
- **SCSS** con CSS custom properties (single source of truth in [src/styles/_tokens.scss](src/styles/_tokens.scss))
- **Reactive Forms** native (no `[(ngModel)]` per la logica di form)
- **HttpClient** nativo (no librerie HTTP esterne)
- **Signals** per state management lightweight
- **Jasmine + Karma** per i test

Niente librerie UI esterne — tutto è derivato direttamente dai design token di Figma.

## Quick start

```bash
# Install
npm install

# Dev — avvia api mock (4201) + ng serve (4200) in parallelo
npm run dev

# Singoli script
npm start         # solo ng serve
npm run api       # solo dev-api con --watch
npm run build     # build di produzione
npm test          # Jasmine/Karma
npm run lint      # Angular ESLint
npm run typecheck # tsc --noEmit
```

Apri http://localhost:4200 per la home dashboard.

## La pipeline `/figma-pipeline`

Comando Claude Code che trasforma un nodo Figma (o screenshot) in una feature Angular completa: codice + documentazione + test.

```
/figma-pipeline nome="<kebab-case>" figmaNode="<node-id>"
```

### Le 9 fasi

| # | Fase | Output |
|---|------|--------|
| **0** | Setup & cache D1 | lettura pattern dei componenti esistenti |
| **1-2** | Estrazione Figma (parallela) | layout, gerarchia, design tokens |
| **3** | Spec funzionale (opzionale) | parsing di `docs/SPEC_<feature>.md` |
| **3.5** | Tracciabilità | matrice Figma ↔ Spec ↔ Codice |
| **4** | Gate C1-C4 | **bloccante** se il piano non è conforme |
| **5** | Code generation | HTML → CSS ∥ TS in parallelo |
| **6** | Sintassi | analisi statica + auto-fix |
| **7** | Runtime | `ng build` con max 5 retry |
| **8** | Documentazione | descrizione funzionale/tecnica finale |
| **9** | Test | spec Jasmine/Karma |

Dettaglio completo in [.claude/commands/figma-pipeline.md](.claude/commands/figma-pipeline.md).

### Comando companion

```
/component-builder componentPath="src/app/features/<nome>" scope="<descrizione>"
```

Fix mirato su una feature esistente, senza ri-eseguire la pipeline completa.

## Regole bloccanti

### Pipeline (D1-D7)

| | Regola |
|--|--------|
| **D1** | Skip Phase 0 se `src/app/features/` contiene solo `_placeholder`; altrimenti leggi 1 componente per consistenza |
| **D2** | Reactive Forms (`FormGroup`/`FormControl`), no `[(ngModel)]` per la logica di form |
| **D3** | No mock hard-coded nel codice di feature: solo `HttpClient` o `// TODO`. Mock in [tools/dev-api.cjs](tools/dev-api.cjs) |
| **D4** | Figma-First: HTML/SCSS derivano dall'estrazione Figma quando disponibile |
| **D5** | Solo standalone components, niente `@NgModule` |
| **D6** | Design token come CSS custom properties in [src/styles/_tokens.scss](src/styles/_tokens.scss), consumati con `var(--name)` |
| **D7** | Per markup ricorrente consultare [.claude/config/component-patterns.yaml](.claude/config/component-patterns.yaml) |

### Componenti (C1-C4)

Specificate in [.claude/skills/angular-best-practices/SKILL.md](.claude/skills/angular-best-practices/SKILL.md): standalone + signals, Reactive Forms tipizzate, service `HttpClient` con `Observable<T>` espliciti, model TS strict.

## Struttura del progetto

```
angular-figma-demo/
├── .claude/                # Pipeline, agenti, skill, pattern (vedi .claude/README.md)
│   ├── CLAUDE.md           # Entry point con regole D1-D7
│   ├── commands/           # Slash command (figma-pipeline, component-builder)
│   ├── agents/             # Subagenti specializzati (extractors, generators, validators)
│   ├── skills/             # angular-best-practices (D1-D7, C1-C4)
│   └── config/             # component-patterns.yaml
│
├── src/
│   ├── app/
│   │   ├── core/           # Service singleton, interceptors, guards
│   │   ├── shared/         # Componenti/direttive/pipe riusabili
│   │   ├── features/       # Feature generate dalla pipeline
│   │   ├── shell/          # Home dashboard
│   │   └── preview/        # Preview host dei componenti generati
│   ├── styles/_tokens.scss # Design token (CSS custom properties)
│   └── environments/       # environment{,.prod}.ts
│
├── tools/
│   ├── dev.cjs             # Dev runner (api + ng serve in parallelo)
│   ├── dev-api.cjs         # Mock HTTP API (porta 4201)
│   └── pipeline-state.cjs  # CLI per output/pipeline-state.json
│
├── docs/                   # SPEC opzionali per feature (SPEC_<nome>.md)
├── output/                 # Artifact pipeline (state, report, traceability)
└── figma-screens/          # Screenshot di riferimento Figma
```

## Convenzione marker block

Ciò che la pipeline aggiunge a file condivisi (es. [_tokens.scss](src/styles/_tokens.scss), [tools/dev-api.cjs](tools/dev-api.cjs)) è racchiuso in:

```
// === BEGIN feature:<nome> ===
...
// === END feature:<nome> ===
```

Permette il cleanup automatico via `DELETE /api/feature/:name` (bottone "Elimina componente" sulla home).

## Stato pipeline real-time

[output/pipeline-state.json](output/pipeline-state.json) è la sorgente di verità. Polled ogni 1.5s dalla home, aggiornato dalla pipeline tramite `tools/pipeline-state.cjs` a ogni transizione di fase.

```bash
# A ogni cambio fase la pipeline chiama:
node tools/pipeline-state.cjs begin <nome>
node tools/pipeline-state.cjs phase <0|1-2|3|3.5|4|5|6|7|8|9>
node tools/pipeline-state.cjs done   # o error <phase>
```

## Documentazione di riferimento

| File | Cosa contiene |
|------|---------------|
| [.claude/CLAUDE.md](.claude/CLAUDE.md) | Entry point della pipeline + regole D1-D7 |
| [.claude/AGENTS-MAP.md](.claude/AGENTS-MAP.md) | Diagramma architetturale degli agenti |
| [.claude/RUNBOOK.md](.claude/RUNBOOK.md) | Procedure operative quando qualcosa non va |
| [.claude/ERROR_CATALOG.md](.claude/ERROR_CATALOG.md) | Errori noti + soluzioni |
| [.claude/skills/angular-best-practices/SKILL.md](.claude/skills/angular-best-practices/SKILL.md) | Regole D1-D7 + C1-C4 |

## Licenza

Progetto demo privato. Nessuna licenza pubblica concessa.
