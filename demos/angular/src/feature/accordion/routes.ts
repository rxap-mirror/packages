import { Route } from '@angular/router';
import { faker } from '@faker-js/faker';

const ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./tab-navigation/tab-navigation.component'),
    children: [
      {
        path: 'simple/:uuid',
        loadComponent: () => import('./simple-accordion/simple-accordion.component'),
      },
      {
        path: 'simple',
        redirectTo: 'simple/' + faker.string.uuid(),
      },
      {
        path: 'multiple/:uuid',
        loadComponent: () => import('./multiple-accordion/multiple-accordion.component'),
      },
      {
        path: 'multiple',
        redirectTo: 'multiple/' + faker.string.uuid(),
      },
      {
        path: 'complex/:uuid',
        loadComponent: () => import('./complex-accordion/complex-accordion.component'),
      },
      {
        path: 'complex',
        redirectTo: 'complex/' + faker.string.uuid(),
      },
      {
        path: '**',
        redirectTo: 'simple/' + faker.string.uuid(),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default ROUTES;
