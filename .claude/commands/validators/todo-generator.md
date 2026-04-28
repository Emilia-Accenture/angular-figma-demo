---
name: todo-generator
description: Documento finale di descrizione funzionale e tecnica della feature (Phase 8).
allowed-tools: Read, Write, Edit, Glob, Grep
---

# /todo-generator

## Input

Tutti gli artefatti `output/temp/<feature>_*.md` (Phase 1-7) + `output/<feature>_TRACEABILITY.md`.

## Output

`output/<feature>_DESCRIZIONE_FUNZIONALE_TECNICA.md` con sezioni:

1. **Sintesi esecutiva** — 2-3 righe.
2. **Descrizione funzionale** — flusso utente, regole, stati visibili.
3. **Descrizione tecnica** — componenti, service & API, modello, state management.
4. **Esiti qualità** — syntax + runtime check.
5. **Gap e limiti residui** — TODO funzionali, pattern from-scratch, copywriting da validare.
6. **Tracciabilità sorgenti** — link a Figma node, spec, file generati.

## Vincoli

- Niente fatti non presenti negli input. Usa "(non specificato)" come placeholder.
- Niente TODO inline nel codice — vanno solo nella sezione "Gap e limiti residui".
- Ogni affermazione del documento è verificabile contro un artefatto temporaneo.
