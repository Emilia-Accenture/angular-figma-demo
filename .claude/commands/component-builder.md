---
name: component-builder
description: Genera o modifica componenti Angular standalone. Usato dalla pipeline (Phase 5/7) o direttamente per fix puntuali.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# /component-builder

## Modalità

- **Orchestrated**: invocato dalla pipeline (Phase 5 generazione, Phase 7 retry).
- **Standalone**: fix mirato su componente esistente.

## Input standalone

| Parametro | Note |
|-----------|------|
| `componentPath` | es. `src/app/features/task-list` |
| `scope` | descrizione dell'intervento |

```
/component-builder componentPath="src/app/features/task-list" scope="aggiungi colonna priorità"
```

## Workflow standalone

1. Leggi i file del componente.
2. (D1) Se altre feature esistono, leggi 1 componente vicino per consistenza; altrimenti procedi senza.
3. Edit incrementale (no riscritture from-scratch).
4. `npm run typecheck`.

## Workflow orchestrated (Phase 5)

HTML prima → poi CSS + TS in parallelo. Delega a `component-html`, `component-css`, `component-ts`.

## Regole

D1-D7 e C1-C4 (vedi `CLAUDE.md` e `skills/angular-best-practices/SKILL.md`).

## Vincoli

- Non creare file fuori da `src/app/features/<nome>/` se non richiesto.
- Non toccare altre feature senza scope esplicito.
- Se `tsc --noEmit` fallisce, task fallito.
