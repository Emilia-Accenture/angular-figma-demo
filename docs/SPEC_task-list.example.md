# SPEC — task-list (esempio)

> Questo è un file di **esempio** per mostrare il formato atteso da `spec-reader` (Phase 3).
> Per usarlo davvero, rinomina in `SPEC_<nome-feature>.md` e adatta ai tuoi requirements.

## Modello dati

```
Task {
  id: string                            # PK
  title: string (max 120, required)
  description: string (max 1000, optional)
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'medium' | 'high'
  createdAt: ISO date
  updatedAt: ISO date
}
```

## Endpoints

| Metodo | URL | Body | Risposta |
|--------|-----|------|----------|
| GET | /api/tasks | — | Task[] |
| GET | /api/tasks/:id | — | Task |
| POST | /api/tasks | TaskCreate | Task |
| PUT | /api/tasks/:id | Partial<Task> | Task |
| DELETE | /api/tasks/:id | — | void |

## Regole funzionali

- **R1** — un task può passare da `todo` a `doing` solo se ha `priority` valorizzata.
- **R2** — i task con stato `done` sono read-only (form disabilitato).
- **R3** — DELETE permesso solo all'autore o a un admin.
- **R4** — se la lista è vuota, mostra empty state con call-to-action "Crea il primo".
