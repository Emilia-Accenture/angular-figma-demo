# Errori comuni

| Codice | Sintomo | Causa | Fix |
|--------|---------|-------|-----|
| E01 | `NG5002 unclosed block` su `@` | Angular interpreta `@` come control-flow | Sostituire con `&#64;` |
| E02 | Property `details` not exist con alias | `as` non propagato in `@else if` (Angular 17.3) | Riscrivere come `@else { @if (... ; as details) { ... } }` |
| E03 | Hex hard-coded segnalato | Violazione D6 | Aggiungere token a `_tokens.scss` (in marker block) |
| E04 | `Cannot find control with name 'X'` | FormControl mancante nel `FormGroup` | Aggiungere control alla group |
| E05 | Mock data array nel componente | Violazione D3 | Spostare mock in `tools/dev-api.cjs` (marker block) |
| E06 | `'app-X' is not a known element` | Componente non in `imports: [...]` | Aggiungere il componente standalone |
| E07 | `*ngIf`/`*ngFor` deprecato | Angular 17 syntax | Usare `@if`/`@for` |
| E08 | Token rimasto in `_tokens.scss` dopo delete | Marker block mancante | Wrappare il token con `// === BEGIN/END feature:<nome> ===` |
| E09 | Phase 7 > 5 retry | Bug logico complesso | Leggere `_07_runtime_report.md`, fix manuale |
| E10 | Build OK ma preview vuoto | Classe componente non esportata o non match `…Component$` | Verificare export e nome classe |
