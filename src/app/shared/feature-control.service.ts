import { Injectable, signal } from '@angular/core';

export interface DeleteResult {
  ok: boolean;
  deleted?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class FeatureControlService {
  readonly busy = signal(false);
  readonly lastError = signal<string | null>(null);

  async deleteFeature(name: string): Promise<DeleteResult> {
    this.busy.set(true);
    this.lastError.set(null);
    try {
      const res = await fetch(`/api/feature/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      const body = (await res.json().catch(() => ({}))) as DeleteResult;
      if (!res.ok || !body.ok) {
        const message =
          body.error ?? `Errore HTTP ${res.status}. Verifica che l'API dev sia attiva (npm run api).`;
        this.lastError.set(message);
        return { ok: false, error: message };
      }
      return body;
    } catch (err) {
      const message = `Impossibile contattare l'API dev (npm run api). ${(err as Error).message}`;
      this.lastError.set(message);
      return { ok: false, error: message };
    } finally {
      this.busy.set(false);
    }
  }
}
