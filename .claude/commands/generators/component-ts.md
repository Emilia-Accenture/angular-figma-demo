---
name: component-ts
description: Genera component class, service HttpClient, model TypeScript e constants. Standalone, signals, Reactive Forms (Phase 5.3).
allowed-tools: Read, Write, Edit, Glob, Grep
---

# /component-ts

## Input

- `output/temp/<feature>_03_spec.md` (modello, endpoints, regole)
- `output/temp/<feature>_04_verified_plan.md`
- HTML appena generato in Phase 5.1

## Output

- `<feature>.component.ts` — standalone, `ChangeDetectionStrategy.OnPush`, signals, Reactive Forms.
- `<feature>.service.ts` — `@Injectable({ providedIn: 'root' })`, `inject(HttpClient)`, metodi `Observable<T>`.
- `<feature>.model.ts` — interfacce con tipi espliciti (no `any`).
- `<feature>.constants.ts` — endpoint URL, opzioni, costanti.

## Pattern obbligatori

- DI: `inject()` (no `constructor(private x: X)`).
- Form: `FormBuilder.nonNullable.group({...})` con `formControlName` nel template.
- Stato: `signal<T>()` + `computed()` per derivati.
- Cleanup observable: `takeUntilDestroyed(this.destroyRef)`.
- Async: preferire `Observable`/`firstValueFrom`, evitare `Promise.then`.

## Vincoli

- C3: tutti i metodi service tipizzati `Observable<T>`. Niente `any`/`unknown` come return.
- C4: model con tipi espliciti, union literal per stati (`'todo' | 'doing' | 'done'`).
- D3: niente mock data. Sempre `HttpClient` o `// TODO: integrate API`.
- D5: no `@NgModule`, `declarations`, `bootstrap`.
