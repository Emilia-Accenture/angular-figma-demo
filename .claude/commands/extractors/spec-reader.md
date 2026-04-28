---
name: spec-reader
description: Legge un file di specifiche funzionali markdown e produce un riepilogo strutturato (Phase 3).
allowed-tools: Read, Grep, Glob
---

# /spec-reader

## Input

| Parametro | Default | Note |
|-----------|---------|------|
| `specPath` | `docs/SPEC_<feature>.md` | opzionale |
| `feature` | — | nome kebab-case |

Se il file non esiste → `SKIPPED`, la pipeline procede con solo Figma.

## Output

`output/temp/<feature>_03_spec.md` — sezioni normalizzate: **Modello dati** (tabella campi/tipi/vincoli), **Endpoints** (tabella metodo/URL/body/risposta), **Regole funzionali** (R1, R2, ...).

## Formato di spec atteso

```markdown
## Modello dati
Task {
  id: string                    # PK
  title: string (max 120, required)
  status: 'todo' | 'doing' | 'done'
}

## Endpoints
GET    /api/tasks       -> Task[]
POST   /api/tasks       body Task -> Task

## Regole funzionali
R1. Un task può passare da `todo` a `doing` solo se ha priorità.
R2. Stato `done` ⇒ form disabilitato.
```

## Vincoli

- Non inventare campi o regole.
- Non mappare a codice (lo fanno `traceability-builder` e `component-ts`).
- Spec malformata → `PARTIAL` + warning, non `FAILED`.
