# `core/`

Cartella per **service applicativi globali**, **interceptors**, **guard** e altri provider singleton.

Convenzioni:
- Tutti i service qui sono `@Injectable({ providedIn: 'root' })`.
- Niente componenti (vanno in `shared/` o `features/`).
- Niente dipendenze cicliche tra `core` e `features`.

Esempi tipici:
- `core/interceptors/error.interceptor.ts`
- `core/guards/auth.guard.ts`
- `core/services/notification.service.ts`
