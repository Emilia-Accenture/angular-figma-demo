---
name: component-html
description: Genera template HTML standalone Angular fedeli al Figma. Usa pattern di component-patterns.yaml e syntax @if/@for (Phase 5.1).
allowed-tools: Read, Write, Edit, Glob, Grep
---

# /component-html

## Input

- `output/temp/<feature>_01_figma_screen.md`
- `output/temp/<feature>_02_design_tokens.md`
- `output/temp/<feature>_04_verified_plan.md`
- `.claude/config/component-patterns.yaml`

## Output

`src/app/features/<feature>/<feature>.component.html` (+ eventuali sub-template).

## Workflow

1. Leggi gli input.
2. Identifica i componenti da creare (container + sub).
3. Per ogni componente: lookup pattern (D7), costruisci il markup, usa Reactive Forms binding (D2).
4. Scrivi i file.

## Sintassi

- Control flow: `@if`/`@for`/`@switch` (Angular 17+). **Vietato** `*ngIf`/`*ngFor`.
- Tabelle dati: `<table>/<thead>/<tbody>` (C1). Liste: `<ul>/<li>`. **Vietato** div fake.
- Form: `[formGroup]` + `formControlName` (C2). **Vietato** `[(ngModel)]` per logica di form, `(input)`/`(change)` come gestione di stato.
- Attenzione al carattere `@` letterale nei template: usare `&#64;` per evitare collisione con i blocchi di control flow.
- Niente inline styles: tutto in `.scss`.

## Vincoli

- Markup deve rispecchiare la gerarchia Figma (D4).
- Nessun reference a `NgModule`.
