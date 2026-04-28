---
name: figma-pipeline
description: Director della pipeline Figma → Angular a 9 fasi.
tools: ['read', 'write', 'edit', 'agent', 'search', 'todo', 'figma']
version: 1.0
---

# Agent: figma-pipeline (v1)

Versione "agent" del comando `/figma-pipeline`. La specifica completa (input, fasi, output, vincoli) è in [`../commands/figma-pipeline.md`](../commands/figma-pipeline.md).

## Quando essere invocato
- Entry point principale per la generazione di una nuova schermata Angular partendo da Figma.

## Fasi coordinate
0. Setup & D1 cache (delegato a `component-builder`)
1-2. Estrazione Figma parallela (`figma-screen-reader` + `figma-design-system`)
3. Spec opzionale (`spec-reader`)
3.5. Tracciabilità (`traceability-builder`)
4. Gate C1-C4 (`template-verifier`)
5. Generazione codice (`component-html` → `component-css` ∥ `component-ts`)
6. Sintassi (`syntax-checker`)
7. Runtime (`runtime-checker`, max 5 retry)
8. Documentazione (`todo-generator`)
9. Test (`test-case-generator`)

## Vedi anche
- [`COMMON-PIPELINE-CONTRACT.md`](../commands/COMMON-PIPELINE-CONTRACT.md): status, gate, resume, metriche.
- [`AGENTS-MAP.md`](../AGENTS-MAP.md): diagramma architetturale.
