---
name: test-case-generator
description: Genera test Jasmine/Karma per i componenti della feature (Phase 9).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /test-case-generator

## Input

- `src/app/features/<feature>/*.component.ts`
- `output/<feature>_TRACEABILITY.md`
- `output/temp/<feature>_03_spec.md`

## Output

- Un `<feature>.component.spec.ts` per ogni componente standalone della feature.
- `output/<feature>_TEST_CASES.md` con la lista casi e coverage qualitativa.

## Famiglie di test

1. **Initialization** — `should create`, signals iniziali, prima call HTTP.
2. **Form binding** — `FormGroup` creato con i controlli attesi.
3. **Service interactions** — `HttpClientTestingModule` + `HttpTestingController`.
4. **Rule enforcement** — validator e regole spec (R1-Rn).

## Convenzioni

- `TestBed.configureTestingModule({ imports: [ComponentStandalone, ReactiveFormsModule], providers: [provideHttpClient(), provideHttpClientTesting()] })`.
- `afterEach(() => httpMock.verify())`.
- Test deterministici: niente `setTimeout`, no race condition (usa `fakeAsync`/`tick`).

## Trappole TypeScript da evitare

Queste due rompono `ng test` con errori che non emergono in `tsc --noEmit` del codice produttivo:

### T1 — `fixture.nativeElement` è tipato `any`

`ComponentFixture<T>.nativeElement` ha tipo `any`. Passare type args a un metodo
chiamato su `any` genera **TS2347 "Untyped function calls may not accept type arguments"**.

❌ NON fare:
```ts
const buttons = fixture.nativeElement.querySelectorAll<HTMLButtonElement>('.btn');
const trigger = fixture.nativeElement.querySelector<HTMLButtonElement>('.x')!;
```

✅ Definire un helper in cima al `describe` e usarlo ovunque:
```ts
function rootEl(fixture: { nativeElement: unknown }): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

const buttons = rootEl(fixture).querySelectorAll<HTMLButtonElement>('.btn');
const trigger = rootEl(fixture).querySelector<HTMLButtonElement>('.x')!;
```

### T2 — narrowing su `let x: T | null = null`

Una `let cached: User | null = null` viene narrata da TS al tipo letterale `null`
nello scope esterno; assegnamenti dentro callback (`subscribe`, `setTimeout`)
non vengono tracciati dal control-flow. `expect(cached).toEqual(realUser)` poi
fallisce con **TS2345**.

❌ NON fare:
```ts
let cached: User | null = null;
service.getOne(id).subscribe((u) => (cached = u));
expect(cached).toEqual(mockUser);  // TS2345
```

✅ Catturare in array:
```ts
const captured: User[] = [];
service.getOne(id).subscribe((u) => captured.push(u));
expect(captured.length).toBe(1);
expect(captured[0]).toEqual(mockUser);
```

In alternativa: `const ref = { current: null as User | null }; ref.current = u;`.

## Vincoli

- Solo `HttpClientTestingModule` per mock HTTP. Niente librerie esterne.
- Solo TestBed standard.
- Dati di test inline ammessi (D3 ha eccezione esplicita per `*.spec.ts`).
- Prima di considerare fatta la Phase 9, eseguire `npx tsc --noEmit -p tsconfig.spec.json` (NON solo `tsconfig.app.json`): solo questo cattura le trappole T1/T2.
