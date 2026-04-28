import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-placeholder-feature',
  template: `
    <p style="margin: 0; color: var(--color-text-muted);">
      Nessun componente disponibile. Genera la prima feature con
      <code>/figma-pipeline</code>.
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderFeatureComponent {}
