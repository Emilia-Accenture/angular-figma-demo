---
name: spec-reader
description: Legge un file di specifiche funzionali markdown e produce un riepilogo strutturato.
tools: ['read', 'search']
version: 1.0
phase: 3
optional: true
---

# Agent: spec-reader (v1)

Specifica completa: [`../../commands/extractors/spec-reader.md`](../../commands/extractors/spec-reader.md).

## Quando essere invocato
- Phase 3 della pipeline (opzionale: terminamento `SKIPPED` se `docs/SPEC_<feature>.md` non esiste).

## Output
- `output/temp/<feature>_03_spec.md`

## Vincoli
- Non inventa campi o regole non presenti nel file.
- File mancante → `SKIPPED`, non `FAILED`.
