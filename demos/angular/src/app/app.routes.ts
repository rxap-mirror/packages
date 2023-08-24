import { Route } from '@angular/router';
import { EmptyRouterOutletComponent } from '@rxap/components';
import { LayoutComponent } from '@rxap/layout';
import { CustomMenuItemComponent } from './layout/custom-menu-item/custom-menu-item.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    data: {
      layout: {
        header: {
          menu: {
            items: [ CustomMenuItemComponent ],
          },
        },
      },
    },
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
