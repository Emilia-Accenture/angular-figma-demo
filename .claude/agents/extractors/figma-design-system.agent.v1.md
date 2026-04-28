---
name: figma-design-system
description: Estrae design tokens (colori, tipografia, spacing, radius, shadow) dal Figma.
tools: ['read', 'figma', 'search']
version: 1.0
phase: 2
---

# Agent: figma-design-system (v1)

Specifica completa: [`../../commands/extractors/figma-design-system.md`](../../commands/extractors/figma-design-system.md).

## Quando essere invocato
- Phase 2 della pipeline (parallelo a `figma-screen-reader`).

## Output
- `output/temp/<feature>_02_design_tokens.md` (con snippet pronto per `_tokens.scss`).

## Vincoli
- Non inventa tokens non presenti in Figma.
- Non scrive direttamente in `_tokens.scss` (compito di `component-css`).
