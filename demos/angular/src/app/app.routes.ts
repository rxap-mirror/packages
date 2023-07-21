import { Route } from '@angular/router';
import { LayoutComponent } from '@rxap/layout';
import { EmptyRouterOutletComponent } from '@rxap/components';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'table',
        loadChildren: () => import('../feature/table/routes'),
      },
      {
        path: 'accordion',
        loadChildren: () => import('../feature/accordion/routes'),
      },
      {
        path: 'fake',
        component: EmptyRouterOutletComponent,
        children: [
          {
            path: ':company',
            component: EmptyRouterOutletComponent,
            children: [
              {
                path: ':product',
                component: EmptyRouterOutletComponent,
                children: [
                  {
                    path: ':material',
                    component: EmptyRouterOutletComponent,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'table',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
