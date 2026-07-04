import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'workbench',
    pathMatch: 'full',
  },
  {
    path: 'workbench',
    loadComponent: () =>
      import('./pages/workbench-page/workbench-page').then((m) => m.WorkbenchPage),
  },
  {
    path: 'matrix',
    loadComponent: () =>
      import('./pages/matrix-page/matrix-page').then((m) => m.MatrixPage),
  },
  {
    path: 'arena',
    loadComponent: () =>
      import('./pages/arena-page/arena-page').then((m) => m.ArenaPage),
  },
  {
    path: 'topology',
    loadComponent: () =>
      import('./pages/topology-page/topology-page').then((m) => m.TopologyPage),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/user-page/user-page').then((m) => m.UserPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings-page/settings-page').then((m) => m.SettingsPage),
  },
];
