import { Route } from '@angular/router';

const ROUTES: Route[] = [
  {
    path: 'complex',
    loadComponent: () => import('./complex-form/complex-form.component'),
  },
  {
    path: '**',
    redirectTo: 'complex',
  },
];

export default ROUTES;
