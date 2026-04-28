# Pipeline map

```
                         /figma-pipeline
                                │
   ┌────────────────────────────┼────────────────────────────┐
   ▼                            ▼                            ▼
Phase 0 (skip se _placeholder unica feature)
   │
   ▼
Phase 1 figma-screen-reader  ║  Phase 2 figma-design-system   (parallelo)
   │
   ▼
Phase 3 spec-reader (opzionale)
   │
   ▼
Phase 3.5 traceability-builder
   │
   ▼
Phase 4 template-verifier ─── gate C1-C4 ───► (NON-CONFORME = stop)
   │
   ▼
Phase 5.1 component-html
   │
   ▼
Phase 5.2 component-css  ║  Phase 5.3 component-ts            (parallelo)
   │
   ▼
Phase 6 syntax-checker
   │
   ▼
Phase 7 runtime-checker (max 5 retry)
   │
   ▼
Phase 8 todo-generator
   │
   ▼
Phase 9 test-case-generator
```

Stato visuale in `output/pipeline-state.json` polled dalla home (1.5s, no-store).
Cleanup di una feature: `DELETE /api/feature/:name` (rimuove cartella, output, marker block in `_tokens.scss` e `dev-api.cjs`).
