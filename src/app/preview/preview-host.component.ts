import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-preview-host',
  template: `
    <div class="preview-host">
      @if (loading) {
        <p class="preview-host__msg">Caricamento componente «{{ name }}»…</p>
      }
      @if (error) {
        <p class="preview-host__msg preview-host__msg--error">{{ error }}</p>
      }
      <ng-template #host></ng-template>
    </div>
  `,
  styles: [
    `
      .preview-host {
        padding: var(--spacing-md);
      }
      .preview-host__msg {
        margin: 0;
        color: var(--color-text-muted);
        font-size: var(--font-size-small);
      }
      .preview-host__msg--error {
        color: var(--color-error);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewHostComponent implements OnInit, OnDestroy {
  @ViewChild('host', { read: ViewContainerRef, static: true })
  private host!: ViewContainerRef;

  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private sub?: Subscription;

  loading = false;
  error: string | null = null;
  name = '';

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params) => {
      const name = params.get('name');
      if (name) {
        this.load(name);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async load(name: string): Promise<void> {
    this.name = name;
    this.error = null;
    this.loading = true;
    this.host.clear();
    this.cdr.markForCheck();

    try {
      const mod: Record<string, unknown> = await import(
        /* @vite-ignore */
        `../features/${name}/${name}.component.ts`
      );
      const candidates = Object.values(mod).filter(
        (v): v is Type<unknown> => typeof v === 'function',
      );
      const componentClass =
        candidates.find((c) => /component$/i.test(c.name ?? '')) ??
        candidates.find((c) => /^[A-Z]/.test(c.name ?? '')) ??
        candidates[0];
      if (!componentClass) {
        this.error = `Nessuna classe componente esportata da features/${name}/${name}.component.`;
      } else {
        this.host.createComponent(componentClass);
      }
    } catch (err) {
      console.error('[preview-host] import failed', err);
      this.error = `Componente "${name}" non trovato. Esegui /figma-pipeline per generarlo.`;
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
}
