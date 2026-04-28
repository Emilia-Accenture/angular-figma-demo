---
name: figma-design-system
description: Estrae design tokens (colori, tipografia, spacing, radius, shadow) da Figma e li traduce in CSS custom properties (Phase 2).
allowed-tools: Read, Grep, Glob, figma/get_design_context, figma/get_variable_defs, figma/get_metadata
---

# /figma-design-system

## Input

| Parametro | Note |
|-----------|------|
| `figmaNode` | schermata target (per estrarre solo i token usati) |
| `designSystemNode` | opzionale, frame Foundation/Tokens |
| `feature` | nome kebab-case |

## Output

`output/temp/<feature>_02_design_tokens.md` con 5 gruppi: **Colors**, **Typography**, **Spacing**, **Radius**, **Shadow**, ciascuno con tabella `--variable-name → valore → uso`. Include uno snippet pronto per `_tokens.scss`.

## Workflow

1. Se `designSystemNode` è fornito, `figma/get_variable_defs` su quel node.
2. Altrimenti, estrai inline styles + variables dal `figmaNode` (token usati).
3. Naming standard `--color-*`, `--font-*`, `--spacing-*`, `--radius-*`, `--shadow-*`.
4. Se due colori sono identici, suggerire alias.

## Vincoli

- Non inventare token assenti da Figma.
- Non scrivere in `_tokens.scss`: lo fa `component-css` (Phase 5.2) usando il marker block `=== BEGIN/END feature:<nome> ===`.
- Token estratti da inline styles → marca `(extracted from inline styles)`.

Eseguito in parallelo con `figma-screen-reader`.
