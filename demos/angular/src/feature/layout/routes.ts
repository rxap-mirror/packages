import { Route } from '@angular/router';

export const ROUTES: Route[] = [
  {
    path: 'large-content',
    loadComponent: () => import('./large-content/large-content.component'),
  },
  { path: '**', redirectTo: 'large-content' }
];

export default ROUTES;
