import { Route } from '@angular/router';

export const ROUTES: Route[] = [
  {
    path: 'large-content',
    loadComponent: () => import('./large-content/large-content.component'),
  },
  {
    path: 'info',
    loadComponent: () => import('./layout-info/layout-info.component'),
  },
  { path: '**', redirectTo: 'info' }
];

export default ROUTES;
