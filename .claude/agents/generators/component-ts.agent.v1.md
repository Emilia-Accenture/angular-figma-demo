---
name: component-ts
description: Genera component class, service HttpClient, model TS e constants per la feature.
tools: ['read', 'write', 'edit', 'search']
version: 1.0
phase: 5.3
---

# Agent: component-ts (v1)

Specifica completa: [`../../commands/generators/component-ts.md`](../../commands/generators/component-ts.md).

## Output
- `src/app/features/<feature>/<feature>.component.ts`
- `src/app/features/<feature>/<feature>.service.ts`
- `src/app/features/<feature>/<feature>.model.ts`
- `src/app/features/<feature>/<feature>.constants.ts`

## Regole bloccanti
- D2 (Reactive Forms), D3 (no mock), D5 (standalone).
- C3 (HttpClient tipizzato), C4 (model tipizzato).
