---
name: component-builder
description: Agente esecutore che modifica/genera codice Angular standalone.
tools: ['read', 'write', 'edit', 'search']
version: 1.0
---

# Agent: component-builder (v1)

Versione "agent" del comando `/component-builder`. La specifica completa è in [`../commands/component-builder.md`](../commands/component-builder.md).

## Modalità

- **Orchestrated**: invocato da `figma-pipeline` durante Phase 0 (cache D1), Phase 5 (generazione), Phase 7.X (fix iterativi).
- **Standalone**: invocato direttamente per fix puntuali su componenti esistenti.

## Riferimenti

- Regole bloccanti D1-D7: [`../commands/generators/_base-generator-rules.md`](../commands/generators/_base-generator-rules.md).
- Regole C1-C4: [`../skills/angular-best-practices/SKILL.md`](../skills/angular-best-practices/SKILL.md).
- Pattern UI: [`../config/component-patterns.yaml`](../config/component-patterns.yaml).
