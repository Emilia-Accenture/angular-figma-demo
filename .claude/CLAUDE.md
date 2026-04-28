# angular-figma-demo

Demo Angular 17+ che genera componenti standalone da screenshot/Figma via la pipeline `/figma-pipeline`.

## Stack

Angular 17 standalone · TypeScript stretto · SCSS con CSS custom properties · Reactive Forms · `HttpClient` nativo · niente UI lib esterne.

## Comandi

- `/figma-pipeline nome="<kebab>" figmaNode="<node-id>"` — pipeline 9 fasi → schermata completa.
- `/component-builder componentPath="src/app/features/<nome>" scope="<descrizione>"` — fix mirato su una feature esistente.

## Regole bloccanti (D1-D7)

- **D1** Se `src/app/features/` contiene solo `_placeholder`, salta Phase 0; altrimenti leggi 1 componente per consistenza.
- **D2** Reactive Forms (`FormGroup`/`FormControl`), no `[(ngModel)]` per la logica di form.
- **D3** No mock hard-coded nel codice di feature: solo `HttpClient` o `// TODO`. Mock in `tools/dev-api.cjs`.
- **D4** Figma-First: HTML/SCSS derivano dall'estrazione Figma quando disponibile.
- **D5** Solo standalone components, niente `@NgModule`.
- **D6** Design tokens come CSS custom properties in `src/styles/_tokens.scss`, consumati con `var(--name)`.
- **D7** Per markup ricorrente consultare `.claude/config/component-patterns.yaml`.

Regole specifiche per componenti (C1-C4) in `skills/angular-best-practices/SKILL.md`.

## Convenzione marker block

Ciò che la pipeline aggiunge a file condivisi (es. `_tokens.scss`, `tools/dev-api.cjs`) va racchiuso in:

```
// === BEGIN feature:<nome> ===
...
// === END feature:<nome> ===
```

Permette il cleanup automatico via `DELETE /api/feature/:name`.

## Struttura

- `commands/` slash command (entry point: `figma-pipeline`, `component-builder`).
- `agents/` definizioni dei subagenti pipeline.
- `skills/angular-best-practices/SKILL.md` regole D1-D7 + C1-C4.
- `config/component-patterns.yaml` catalogo pattern UI.

## Path runtime

- Output temp: `output/temp/<nome>_0N_*.md`
- Componenti: `src/app/features/<nome>/`
- Tokens: `src/styles/_tokens.scss`
- Spec opzionale: `docs/SPEC_<nome>.md`
- Stato pipeline: `output/pipeline-state.json` (polled dalla home).
