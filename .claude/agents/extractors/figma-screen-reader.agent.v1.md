---
name: figma-screen-reader
description: Estrae layout, gerarchia componenti e interazioni da una schermata Figma.
tools: ['read', 'figma', 'search']
version: 1.0
phase: 1
---

# Agent: figma-screen-reader (v1)

Specifica completa: [`../../commands/extractors/figma-screen-reader.md`](../../commands/extractors/figma-screen-reader.md).

## Quando essere invocato
- Phase 1 della pipeline (parallelo a `figma-design-system`).

## Output
- `output/temp/<feature>_01_figma_screen.md`

## Vincoli
- Solo lettura su Figma + scrittura sul file di output.
- Non inventa interazioni non dichiarate.
