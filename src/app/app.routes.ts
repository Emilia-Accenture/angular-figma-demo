import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./shell/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'preview/:name',
    loadComponent: () =>
      import('./preview/preview-host.component').then(m => m.PreviewHostComponent),
  },
  // Le feature generate dalla pipeline NON vanno registrate qui staticamente:
  // la rotta `preview/:name` (sopra) le carica dinamicamente da features/<name>/.
  // Aggiungere import statici qui rompe il build quando la feature viene
  // eliminata via "Elimina componente" (DELETE /api/feature/:name).
  {
    path: '**',
    redirectTo: '',
  },
];
