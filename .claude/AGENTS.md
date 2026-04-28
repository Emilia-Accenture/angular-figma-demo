# Registro agenti pipeline

Pipeline Figma → Angular a 9 fasi, organizzata in 4 categorie. Le definizioni dei singoli agenti vivono accanto a questo file in `agents/` e replicano il comando slash corrispondente in `commands/`.

| Categoria | Agente | Fase | Ruolo |
|-----------|--------|:---:|-------|
| Orchestration | `figma-pipeline` | — | director della pipeline |
| Orchestration | `component-builder` | 5, 7 | esecutore generazione/fix |
| Extractors | `figma-screen-reader` | 1 | layout + componenti dalla schermata |
| Extractors | `figma-design-system` | 2 | tokens (colori, tipografia, ...) |
| Extractors | `spec-reader` | 3 | parsing spec funzionale opzionale |
| Generators | `component-html` | 5.1 | template HTML |
| Generators | `component-css` | 5.2 | SCSS + tokens block in `_tokens.scss` |
| Generators | `component-ts` | 5.3 | component class, service, model, constants |
| Validators | `template-verifier` | 4 | gate C1-C4 (bloccante) |
| Validators | `traceability-builder` | 3.5 | matrice Figma ↔ Spec ↔ Codice |
| Validators | `syntax-checker` | 6 | tsc/html/scss + auto-fix |
| Validators | `runtime-checker` | 7 | `ng build` + auto-fix iterativo (5 retry) |
| Validators | `todo-generator` | 8 | doc funzionale e tecnica |
| Validators | `test-case-generator` | 9 | spec Jasmine/Karma |

Regole bloccanti (D1-D7, C1-C4): `skills/angular-best-practices/SKILL.md`.
