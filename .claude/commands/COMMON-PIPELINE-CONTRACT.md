# Pipeline contract

## Status di chiusura agente

| Status | Significato | Effetto |
|--------|-------------|---------|
| `SUCCESS` | OK | procede |
| `PARTIAL` | OK con warning | procede + log |
| `SKIPPED` | fase saltata (es. spec assente) | procede |
| `FAILED` | output non utilizzabile | stop |

## Gate bloccanti

- **Phase 4 (template-verifier)**: `NON-CONFORME` (< 70%) → stop.
- **Phase 7 (runtime-checker)**: 5 retry esauriti → `MANUAL_REQUIRED`.

## Stato visuale

`output/pipeline-state.json` (schema in `commands/figma-pipeline.md`).

## Resume

Ogni agente non distruttivo è idempotente. Resume via:
```
/figma-pipeline resume=true nome="<kebab>"
```
Manifest in `output/checkpoints/<nome>_resume_manifest.json`.
