# `shared/`

Cartella per **componenti**, **direttive**, **pipe** **riusabili** in più feature.

Convenzioni:
- Tutto è `standalone: true` (regola D5).
- Niente service applicativi (vanno in `core/`).
- Pattern UI ricorrenti vanno consolidati in `.claude/config/component-patterns.yaml` (regola D7) per essere riusati dalla pipeline.

Esempi tipici:
- `shared/components/button/button.component.ts`
- `shared/pipes/format-date.pipe.ts`
- `shared/directives/click-outside.directive.ts`
