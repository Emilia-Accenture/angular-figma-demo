---
name: component-css
description: Genera SCSS dei componenti usando CSS custom properties. Mobile-first, BEM-light (Phase 5.2).
allowed-tools: Read, Write, Edit, Glob, Grep
---

# /component-css

## Input

- `output/temp/<feature>_02_design_tokens.md`
- HTML appena generato in Phase 5.1 (per le classi effettivamente usate)
- `.claude/config/component-patterns.yaml`

## Output

- `src/app/features/<feature>/<feature>.component.scss`
- `src/styles/_tokens.scss` aggiornato (solo per token feature-specifici, dentro **marker block** `// === BEGIN/END feature:<nome> ===` in entrambi i `:root` light e dark).

## Workflow

1. Leggi i token e l'HTML.
2. Aggiungi a `_tokens.scss` solo i token mancanti (mai sovrascrivere preesistenti, sempre dentro marker block).
3. Genera lo SCSS solo per le classi presenti nel template.
4. Mobile-first: regole base, poi `@media (min-width: ...)`.

## Regole

- Naming **BEM-light**: `.block__element--modifier`.
- Solo `var(--token)` per colori/spacing/radius/shadow (D6).
- **Vietato**: hex hard-coded, variabili SCSS (`$x`) per colori, `!important` non documentato, `::ng-deep`.
- I `//` comments funzionano in SCSS (utilizzati per i marker block).
