import { Route } from '@angular/router';
import { EmptyRouterOutletComponent } from '@rxap/components';
import {
  LayoutComponent,
  NavigationService,
} from '@rxap/layout';
import { StatusCheckGuard } from '@rxap/ngx-status-check';
import { APP_NAVIGATION_PROVIDER } from './app.navigation';
import { CustomMenuItemComponent } from './layout/custom-menu-item/custom-menu-item.component';

const ROUTES: Route[] = [
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
        path: 'error',
        loadChildren: () => import('../feature/error/routes'),
      },
      {
        path: '**',
        redirectTo: 'table',
      },
    ],
    providers: [
      APP_NAVIGATION_PROVIDER,
      NavigationService,
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default ROUTES;
