---
name: figma-pipeline
description: Pipeline Figma → Angular a 9 fasi. Genera una nuova schermata standalone partendo da node Figma o screenshot.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, TodoWrite, figma/get_design_context, figma/get_screenshot, figma/get_metadata, figma/get_variable_defs
---

# /figma-pipeline

Orchestratore a 9 fasi. Produce componenti in `src/app/features/<nome>/` + doc/test in `output/`.

## Input

| Parametro | Obbl. | Default | Note |
|-----------|:---:|---------|------|
| `nome` | ✅ | — | kebab-case |
| `figmaNode` | ⚠️ | — | se assente, fallback su screenshot allegato |
| `specPath` | ❌ | `docs/SPEC_<nome>.md` | spec funzionale opzionale |
| `resume` | ❌ | `false` | riprende da `output/checkpoints/<nome>_resume_manifest.json` |

## Esempio

```
/figma-pipeline nome="task-list" figmaNode="123:456"
```

## Stato visuale (obbligatorio)

**SEMPRE** usare `tools/pipeline-state.cjs` — **mai** scrivere `output/pipeline-state.json` a mano. Il file è la sorgente di verità della home (polling ogni 1.5s); se non viene aggiornato a ogni transizione, la casella si "blocca" e poi salta avanti. Stimare `phaseTimes` invece di misurarli produce totali sballati.

```bash
# ALL'INIZIO (subito, prima di leggere/scrivere altro):
node tools/pipeline-state.cjs begin <nome>

# A ogni cambio fase (PRIMA di iniziare il lavoro della nuova fase):
node tools/pipeline-state.cjs phase 1-2
node tools/pipeline-state.cjs phase 3
# ... una chiamata per fase, in ordine

# A FINE pipeline:
node tools/pipeline-state.cjs done

# Su errore non recuperabile:
node tools/pipeline-state.cjs error <phaseFallita>
```

Lo script calcola `phaseTimes` come delta wall-clock fra le chiamate (`Date.now()`), aggiorna `updatedAt` a ogni invocazione, e sigilla `totalTimeMs` su `done`/`error`. Niente stime, niente file scritto a mano.

`currentPhase` ∈ `"0"`, `"1-2"`, `"3"`, `"3.5"`, `"4"`, `"5"`, `"6"`, `"7"`, `"8"`, `"9"` (lo script valida).

## Marker block (cleanup)

Tutto ciò che la pipeline aggiunge a **file condivisi** va racchiuso in:

```
// === BEGIN feature:<nome> ===
...
// === END feature:<nome> ===
```

Si applica a `src/styles/_tokens.scss` e `tools/dev-api.cjs`. Cleanup via `DELETE /api/feature/:name`.

## Fasi

| # | Agent | Output | Note |
|---|-------|--------|------|
| **0** | (inline) | — | Skip se `src/app/features/` contiene solo `_placeholder`; altrimenti leggi 1 componente. |
| **1-2** | `figma-screen-reader` ∥ `figma-design-system` | `<nome>_01_figma_screen.md`, `<nome>_02_design_tokens.md` | Parallelo. Fallback: screenshot allegato. |
| **3** | `spec-reader` | `<nome>_03_spec.md` | Skip se `docs/SPEC_<nome>.md` assente. |
| **3.5** | `traceability-builder` | `<nome>_TRACEABILITY.md` | Matrice Figma↔Spec↔Codice. |
| **4** | `template-verifier` | `<nome>_04_verified_plan.md` | Gate C1-C4: `CONFORME` / `PARZIALE` / `NON-CONFORME` (stop). |
| **5** | `component-html` → `component-css` ∥ `component-ts` | feature folder | HTML prima, poi CSS+TS in parallelo. |
| **6** | `syntax-checker` | `<nome>_06_syntax_report.md` | `tsc --noEmit`. |
| **7** | `runtime-checker` | `<nome>_07_runtime_report.md` | `ng build`. Auto-fix max 5 retry. |
| **8** | `todo-generator` | `<nome>_DESCRIZIONE_FUNZIONALE_TECNICA.md` | Consolida output precedenti. |
| **9** | `test-case-generator` | `*.spec.ts` + `<nome>_TEST_CASES.md` | Jasmine/Karma. |

## Output finale

```
src/app/features/<nome>/<nome>.{component.ts,component.html,component.scss,component.spec.ts,service.ts,model.ts,constants.ts}
output/<nome>_{TRACEABILITY,DESCRIZIONE_FUNZIONALE_TECNICA,TEST_CASES}.md
```

## Vincoli

- Phase 4 `NON-CONFORME` → stop.
- Phase 7 max 5 retry.
- Mai violare D1-D7 (vedi `CLAUDE.md`).
