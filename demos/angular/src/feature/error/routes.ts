import { Route } from '@angular/router';

const ROUTES: Route[] = [
  {
    path: 'http',
    loadComponent: () => import('./http-error/http-error.component'),
  },
  {
    path: 'angular',
    loadComponent: () => import('./angular-error/angular-error.component'),
  },
  {
    path: '**',
    redirectTo: 'http',
  },
];

export default ROUTES;
