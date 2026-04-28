import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';
import { PipelineStateService } from '../shared/pipeline-state.service';
import { FeatureControlService } from '../shared/feature-control.service';

interface PipelineStep {
  phase: string;
  title: string;
  description: string;
}

interface PipelineRow {
  direction: 'ltr' | 'rtl';
  steps: PipelineStep[];
}

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink, ThemeToggleComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly pipelineState = inject(PipelineStateService);
  private readonly featureControl = inject(FeatureControlService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly stepsPerRow = 3;
  readonly previewBust = signal(0);
  readonly resetError = signal<string | null>(null);
  readonly resetBusy = this.featureControl.busy;

  readonly pipelineSteps: PipelineStep[] = [
    { phase: '0', title: 'Setup & cache D1', description: 'Lettura pattern dei componenti esistenti.' },
    { phase: '1-2', title: 'Estrazione Figma', description: 'Layout, gerarchia componenti e design tokens (in parallelo).' },
    { phase: '3', title: 'Spec funzionale', description: 'Lettura opzionale di docs/SPEC_<feature>.md.' },
    { phase: '3.5', title: 'Tracciabilità', description: 'Mapping Figma ↔ Spec ↔ Codice.' },
    { phase: '4', title: 'Gate C1-C4', description: 'Verifica conformità del piano di generazione.' },
    { phase: '5', title: 'Code generation', description: 'HTML → CSS + TS in parallelo.' },
    { phase: '6', title: 'Sintassi', description: 'Analisi statica + auto-fix.' },
    { phase: '7', title: 'Runtime', description: 'ng build con fix iterativo (max 5 retry).' },
    { phase: '8', title: 'Documentazione', description: 'Documento funzionale/tecnico finale.' },
    { phase: '9', title: 'Test', description: 'Spec Jasmine generati automaticamente.' },
  ];

  readonly liveMessages: Record<string, string> = {
    '0': 'Sto leggendo i componenti esistenti per imparare pattern e convenzioni del progetto.',
    '1-2': 'Sto estraendo layout, gerarchia componenti e design tokens dal Figma in parallelo.',
    '3': 'Sto leggendo la spec funzionale opzionale per arricchire il piano.',
    '3.5': 'Sto costruendo la matrice di tracciabilità Figma ↔ Spec ↔ Codice.',
    '4': 'Sto verificando il piano contro le regole C1-C4 prima di generare codice.',
    '5': 'Sto generando HTML, SCSS e TypeScript del componente standalone.',
    '6': 'Sto controllando la sintassi del codice generato e applicando auto-fix.',
    '7': 'Sto compilando con ng build, ripeto se necessario (max 5 retry).',
    '8': 'Sto producendo il documento funzionale e tecnico finale.',
    '9': 'Sto generando i test Jasmine per i componenti creati.',
  };

  readonly pipelineRows: PipelineRow[] = this.buildRows(this.pipelineSteps, this.stepsPerRow);

  readonly status = computed(() => this.pipelineState.state().status);
  readonly currentPhase = computed(() => this.pipelineState.state().currentPhase);
  readonly currentFeature = computed(() => this.pipelineState.state().feature);
  readonly phaseTimes = computed(() => this.pipelineState.state().phaseTimes);
  readonly totalTime = computed(() => this.pipelineState.state().totalTimeMs);

  formatMs(ms: number | null | undefined): string {
    if (ms == null) {
      return '';
    }
    if (ms < 1000) {
      return `${Math.round(ms)} ms`;
    }
    const sec = ms / 1000;
    if (sec < 60) {
      return `${sec.toFixed(1)} s`;
    }
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  }

  readonly previewUrl = computed<SafeResourceUrl | null>(() => {
    const feature = this.currentFeature();
    if (!feature) {
      return null;
    }
    const url = `/preview/${encodeURIComponent(feature)}?b=${this.previewBust()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  readonly previewHref = computed(() => {
    const feature = this.currentFeature();
    return feature ? `/preview/${encodeURIComponent(feature)}` : null;
  });

  readonly canReset = computed(() => !!this.currentFeature() && !this.resetBusy());

  async reset(): Promise<void> {
    const feature = this.currentFeature();
    if (!feature) {
      return;
    }
    const confirmed = window.confirm(
      `Eliminare definitivamente la feature "${feature}"?\nVerranno rimossi i file in src/app/features/${feature}/.`,
    );
    if (!confirmed) {
      return;
    }
    this.resetError.set(null);
    const result = await this.featureControl.deleteFeature(feature);
    if (!result.ok) {
      this.resetError.set(result.error ?? 'Errore sconosciuto.');
      return;
    }
    this.previewBust.update((n) => n + 1);
  }

  private readonly currentPhaseIndex = computed(() => {
    const phase = this.currentPhase();
    if (!phase) {
      return -1;
    }
    return this.pipelineSteps.findIndex((s) => s.phase === phase);
  });

  isActive(step: PipelineStep): boolean {
    return this.status() === 'running' && this.currentPhase() === step.phase;
  }

  isDone(step: PipelineStep): boolean {
    if (this.status() === 'done') {
      return true;
    }
    if (this.status() !== 'running') {
      return false;
    }
    const stepIdx = this.pipelineSteps.findIndex((s) => s.phase === step.phase);
    const curIdx = this.currentPhaseIndex();
    return stepIdx >= 0 && curIdx >= 0 && stepIdx < curIdx;
  }

  private buildRows(steps: PipelineStep[], perRow: number): PipelineRow[] {
    const rows: PipelineRow[] = [];
    for (let i = 0; i < steps.length; i += perRow) {
      const rowIndex = i / perRow;
      rows.push({
        direction: rowIndex % 2 === 0 ? 'ltr' : 'rtl',
        steps: steps.slice(i, i + perRow),
      });
    }
    return rows;
  }
}
