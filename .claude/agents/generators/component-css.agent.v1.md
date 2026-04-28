---
name: component-css
description: Genera SCSS dei componenti usando CSS custom properties da _tokens.scss.
tools: ['read', 'write', 'edit', 'search']
version: 1.0
phase: 5.2
---

# Agent: component-css (v1)

Specifica completa: [`../../commands/generators/component-css.md`](../../commands/generators/component-css.md).

## Output
- `src/app/features/<feature>/**/*.component.scss`
- aggiornamento (additivo) di `src/styles/_tokens.scss` se necessario.

## Regole bloccanti
- D6 (CSS custom properties), D7 (pattern catalog).
