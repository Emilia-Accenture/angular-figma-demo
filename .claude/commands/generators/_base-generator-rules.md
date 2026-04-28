# Base Generator Rules — D1-D7

Bloccanti per `component-html`, `component-css`, `component-ts`, `component-builder`.

| # | Regola |
|---|--------|
| **D1** | Se `src/app/features/` ha solo `_placeholder`, salta la lettura; altrimenti leggi 1 componente vicino. |
| **D2** | Reactive Forms only. Niente `[(ngModel)]` per logica di form. |
| **D3** | Niente mock hard-coded nel codice di feature. Solo `HttpClient` o `// TODO`. Mock in `tools/dev-api.cjs`. |
| **D4** | Figma-First quando disponibile. Leggere `output/temp/<feature>_01_figma_screen.md` e `_02_design_tokens.md`. |
| **D5** | Standalone components only. |
| **D6** | Tokens come CSS custom properties in `src/styles/_tokens.scss`, consumati con `var(--name)`. |
| **D7** | Pattern ricorrenti dal catalogo `.claude/config/component-patterns.yaml`. |

Regole specifiche dei componenti (C1-C4): `skills/angular-best-practices/SKILL.md`.
