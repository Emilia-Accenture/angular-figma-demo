---
name: runtime-checker
description: Phase 7 — esegue ng build con auto-fix iterativo (max 5 retry).
tools: ['read', 'write', 'edit', 'execute', 'search']
version: 1.0
phase: 7
gate: true
maxRetries: 5
---

# Agent: runtime-checker (v1)

Specifica completa: [`../../commands/validators/runtime-checker.md`](../../commands/validators/runtime-checker.md).

## Output
- `output/temp/<feature>_07_runtime_report.md` con esito (`BUILD_OK` / `AUTO_FIXED` / `MANUAL_REQUIRED`).
