---
name: syntax-checker
description: Verifica sintassi TS/HTML/SCSS e applica auto-fix per errori comuni (Phase 6).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /syntax-checker

## Workflow

1. **TS**: `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`).
2. **HTML**: parse manuale (tag chiusi, binding `[]`/`()`/`[()]`, escape `&#64;` se serve `@` letterale).
3. **SCSS**: nesting valido, variabili usate vs. definite in `_tokens.scss`.
4. Auto-fix di pattern comuni: import TS mancante, virgola mancante in `imports: [...]`, tag self-closing rotto.

## Output

`output/temp/<feature>_06_syntax_report.md` con tabella per file (esito, fix applicati) e status finale.

## Vincoli

- Max 1 round di auto-fix. Errori residui vanno al `runtime-checker`.
- Non toccare la logica del componente, solo la sintassi.
- Errori semantici (es. `Property 'X' does not exist`) → lasciati a Phase 7.
