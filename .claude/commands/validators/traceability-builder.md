---
name: traceability-builder
description: Costruisce la matrice di tracciabilità Figma ↔ Spec ↔ Codice (Phase 3.5).
allowed-tools: Read, Write, Edit, Glob, Grep
---

# /traceability-builder

## Input

- `output/temp/<feature>_01_figma_screen.md`
- `output/temp/<feature>_02_design_tokens.md`
- `output/temp/<feature>_03_spec.md` (opzionale)

## Output

`output/<feature>_TRACEABILITY.md` con tabelle:

1. **UI ↔ Modello ↔ Codice**: Figma element → entità modello → componente Angular → service/API.
2. **Regole ↔ Codice**: Rxx → metodo/classe che la implementa → status (`implemented`/`todo`).
3. **Tokens ↔ Componenti**: token Figma → CSS variable → classi che li consumano.

## Vincoli

- Niente mapping inventati. Usa `<UNKNOWN>` o `(non specificato)` quando manca un input.
- Spec assente → la sezione "Modello" è inferita dal Figma e marcata `(inferito da Figma)`.
