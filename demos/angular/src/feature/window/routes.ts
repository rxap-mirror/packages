import { Route } from '@angular/router';

const ROUTES: Route[] = [
  {
    path: 'demo',
    loadComponent: () => import('./window-demo/window-demo.component'),
  },
  {
    path: '**',
    redirectTo: 'demo',
  },
];

export default ROUTES;
