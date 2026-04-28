---
name: runtime-checker
description: Esegue ng build con auto-fix iterativi (max 5 retry) — gate Phase 7.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# /runtime-checker

## Workflow

1. `npm run build` (= `ng build`).
2. Cattura stderr e parsifica errori (file:line:codice).
3. Filtra agli errori della feature corrente.
4. Applica fix per categoria; re-run; max **5 iterazioni**.

## Pattern di auto-fix più frequenti

| Errore | Fix |
|--------|-----|
| `TS2304 Cannot find name` | aggiungi import |
| `TS2322/TS2345 not assignable` | type guard / cast |
| `TS2339 property does not exist` | corretto nome o aggiunto al model |
| `NG8001 not a known element` | aggiungi import standalone in `imports: [...]` |
| `Cannot find control with name 'X'` | aggiungi `FormControl` al `FormGroup` |
| `NG5002 unclosed block` (template) | escape `@` letterale come `&#64;` |

## Esiti

- `BUILD_OK` — zero errori al primo tentativo.
- `AUTO_FIXED` — risolto in N retry.
- `MANUAL_REQUIRED` — 5 retry esauriti.

## Output

`output/temp/<feature>_07_runtime_report.md`.

## Vincoli

- Max 5 iterazioni.
- Modifiche solo nella feature corrente.
- Se un fix peggiora il count errori, rollback dell'ultimo e marca `MANUAL_REQUIRED`.
- Mai disabilitare regole TS globalmente.
