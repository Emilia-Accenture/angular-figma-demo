import { DestroyRef, Injectable, inject, signal } from '@angular/core';

export type PipelineStatus = 'idle' | 'running' | 'done' | 'error';

export interface PipelineState {
  feature: string | null;
  currentPhase: string | null;
  status: PipelineStatus;
  updatedAt: string | null;
  phaseTimes: Record<string, number>;
  totalTimeMs: number | null;
}

const IDLE_STATE: PipelineState = {
  feature: null,
  currentPhase: null,
  status: 'idle',
  updatedAt: null,
  phaseTimes: {},
  totalTimeMs: null,
};

const POLL_INTERVAL_MS = 1500;
const STATE_URL = 'pipeline-state.json';

@Injectable({ providedIn: 'root' })
export class PipelineStateService {
  private readonly _state = signal<PipelineState>(IDLE_STATE);
  readonly state = this._state.asReadonly();

  private intervalId: number | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
    if (typeof window !== 'undefined') {
      this.refresh();
      this.intervalId = window.setInterval(() => this.refresh(), POLL_INTERVAL_MS);
    }
  }

  private stop(): void {
    if (this.intervalId !== undefined && typeof window !== 'undefined') {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async refresh(): Promise<void> {
    try {
      const res = await fetch(`${STATE_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) {
        this._state.set(IDLE_STATE);
        return;
      }
      const raw = (await res.json()) as Partial<PipelineState> | null;
      this._state.set({
        feature: raw?.feature ?? null,
        currentPhase: raw?.currentPhase ?? null,
        status: raw?.status ?? 'idle',
        updatedAt: raw?.updatedAt ?? null,
        phaseTimes: raw?.phaseTimes ?? {},
        totalTimeMs: raw?.totalTimeMs ?? null,
      });
    } catch {
      // file mancante o JSON malformato → resta nello stato precedente.
    }
  }
}
