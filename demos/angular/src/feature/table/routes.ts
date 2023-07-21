import { Route } from '@angular/router';

const ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./tab-navigation/tab-navigation.component'),
    children: [
      {
        path: 'minimum',
        loadComponent: () => import('./minimum-table/minimum-table.component'),
      },
      {
        path: 'maximum-tree',
        loadComponent: () => import('./maximum-tree-table/maximum-tree-table.component'),
      },
      {
        path: 'filter',
        loadComponent: () => import('./filter-table/filter-table.component'),
      },
      {
        path: 'action',
        loadComponent: () => import('./action-table/action-table.component'),
      },
      {
        path: 'header-button',
        loadComponent: () => import('./header-button-table/header-button-table.component'),
      },
      {
        path: '**',
        redirectTo: 'minimum',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default ROUTES;
