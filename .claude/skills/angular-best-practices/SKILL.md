---
name: angular-best-practices
description: Regole bloccanti D1-D7 (pipeline) e C1-C4 (componenti) per angular-figma-demo.
---

# Best practices — angular-figma-demo

Regole **bloccanti**. Da consultare prima di generare codice.

## D1-D7 — Regole pipeline

| # | Regola |
|---|--------|
| **D1** | Se `src/app/features/` ha solo `_placeholder`, salta la lettura; altrimenti leggi 1 componente esistente per consistenza. |
| **D2** | Reactive Forms only (`FormGroup`/`FormControl`). |
| **D3** | Nessun mock hard-coded nel codice di feature. Solo `HttpClient` o `// TODO`. Mock in `tools/dev-api.cjs`. |
| **D4** | Figma-First quando disponibile, altrimenti screenshot/spec. |
| **D5** | Solo standalone components. |
| **D6** | Design tokens come CSS custom properties in `_tokens.scss`. Consumati con `var(--name)`. |
| **D7** | Pattern ricorrenti dal catalogo `.claude/config/component-patterns.yaml`. |

## C1-C4 — Regole componente

- **C1** Tabelle dati con HTML semantico (`<table>/<thead>/<tbody>`). Liste con `<ul>/<li>`.
- **C2** Input utente solo dentro `FormGroup` con `formControlName`.
- **C3** Service `@Injectable({ providedIn: 'root' })` con `inject(HttpClient)` e tipi espliciti su tutti i metodi (`Observable<T>`).
- **C4** Interfacce TS con tipi espliciti, no `any`, union types/literal per stati.

## Pattern di stato consigliato

```ts
type ViewState = 'idle' | 'loading' | 'success' | 'error';
readonly state = signal<ViewState>('idle');
```

## Checklist pre-commit

- [ ] `standalone: true`
- [ ] No mock data hard-coded
- [ ] SCSS usa solo `var(--token)`
- [ ] Service tipizzato con `Observable<T>`
- [ ] Modello senza `any`
- [ ] Spec `*.spec.ts` presente
