import { Route } from '@angular/router';
import { EmptyRouterOutletComponent } from '@rxap/components';
import { LayoutComponent } from '@rxap/layout';
import {
  STATUS_CHECK_ROUTE,
  StatusCheckGuard,
} from '@rxap/ngx-status-check';
import { CustomMenuItemComponent } from './layout/custom-menu-item/custom-menu-item.component';

export const appRoutes: Route[] = [
  STATUS_CHECK_ROUTE,
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
    canActivateChild: [ StatusCheckGuard ],
    children: [
      {
        path: 'table',
        data: {
          statusCheck: {
            services: [ 'service-app-angular-table' ],
          },
        },
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
