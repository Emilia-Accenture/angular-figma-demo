---
name: template-verifier
description: Verifica conformità del piano di generazione alle regole C1-C4. Gate bloccante della Phase 4.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# /template-verifier

## Input

- `output/temp/<feature>_01_figma_screen.md`
- `output/temp/<feature>_02_design_tokens.md`
- `output/temp/<feature>_03_spec.md` (se presente)

## Output

`output/temp/<feature>_04_verified_plan.md` con: piano di generazione (componenti, service, model, constants), tabella verifica regole, esito gate.

## Esito gate

| Esito | Score | Azione |
|-------|-------|--------|
| **CONFORME** | ≥ 100% | procede a Phase 5 |
| **PARZIALE** | 70-99% | procede in modalità SKELETON con warning |
| **NON-CONFORME** | < 70% | STOP, intervento umano |

## Regole verificate

| # | Verifica |
|---|----------|
| **C1** | Tabelle dati = `<table>` semantico, non `<div>` fake. Eccezione: card-grid. |
| **C2** | Form/search = Reactive Forms con `formGroup` + `formControlName`. |
| **C3** | Service: `HttpClient` con tipi espliciti su tutti i metodi. |
| **C4** | Model: tipi espliciti, no `any`, union literal per stati. |
| **D7** | Pattern UI in `component-patterns.yaml` o marcati `FROM-SCRATCH`. |

## Vincoli

- Read-only sui file sorgente; write-only sull'output.
- `NON-CONFORME` ferma la pipeline.
- Warning di `PARZIALE` propagati al report finale (Phase 8).
