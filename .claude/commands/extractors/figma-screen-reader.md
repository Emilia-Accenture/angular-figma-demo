---
name: figma-screen-reader
description: Estrae layout, gerarchia componenti e interazioni da una schermata Figma (Phase 1).
allowed-tools: Read, Grep, Glob, figma/get_design_context, figma/get_screenshot, figma/get_metadata
---

# /figma-screen-reader

## Input

| Parametro | Note |
|-----------|------|
| `figmaNode` | required (fallback: screenshot allegato) |
| `feature` | nome kebab-case |

## Output

`output/temp/<feature>_01_figma_screen.md` — sezioni: Layout, Componenti riconosciuti (mapping a `component-patterns.yaml`), Interazioni, Stati (empty/loading/error).

## Workflow

1. `figma/get_metadata` per la struttura.
2. `figma/get_screenshot` (salvato in `figma-screens/<feature>.png` se assente).
3. `figma/get_design_context` per il contesto.
4. Lookup pattern in `.claude/config/component-patterns.yaml`.
5. Annotare interazioni e stati alternativi (frame `/empty`, `/error`, ...).

## Vincoli

- Solo lettura Figma. Nessuna scrittura di codice.
- Pattern non in catalogo → `<UNKNOWN>` + warning.
- Interazione non dichiarata in Figma → `(non specificato)`.

Eseguito in parallelo con `figma-design-system`. Output consumato da `traceability-builder`, `template-verifier`, `component-html`, `component-ts`.
