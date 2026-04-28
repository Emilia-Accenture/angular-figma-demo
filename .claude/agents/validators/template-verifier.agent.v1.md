---
name: template-verifier
description: Gate Phase 4 — verifica conformità del piano alle regole C1-C4.
tools: ['read', 'write', 'edit', 'search']
version: 1.0
phase: 4
gate: true
---

# Agent: template-verifier (v1)

Specifica completa: [`../../commands/validators/template-verifier.md`](../../commands/validators/template-verifier.md).

## Output
- `output/temp/<feature>_04_verified_plan.md` con esito gate (`CONFORME` / `PARZIALE` / `NON-CONFORME`).
