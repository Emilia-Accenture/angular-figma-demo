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

## Vincoli

- Solo `HttpClientTestingModule` per mock HTTP. Niente librerie esterne.
- Solo TestBed standard.
- Dati di test inline ammessi (D3 ha eccezione esplicita per `*.spec.ts`).
