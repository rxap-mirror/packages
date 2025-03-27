import { inject } from '@angular/core';
import { Route } from '@angular/router';
import { EmptyRouterOutletComponent } from '@rxap/components';
import {
  LayoutComponent,
  provideLayout,
  withDefaultHeaderComponent,
  withNavigationConfig,
  withSettingsMenuItems,
} from '@rxap/layout';
import { ChangelogService } from '@rxap/ngx-changelog';
import { LanguageSelectorMenuItemComponent } from '@rxap/ngx-material-localize';
import { StatusCheckGuard } from '@rxap/ngx-status-check';
import { provideUserTheme } from '@rxap/ngx-user';
import { AuthenticationGuard } from '@rxap/oauth';
import { APP_NAVIGATION } from './app.navigation';

const ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [ AuthenticationGuard ],
    canActivateChild: [ StatusCheckGuard ],
    children: [
      {
        path: 'window',
        loadChildren: () => import('../feature/window/routes')
      },
      {
        path: 'layout',
        loadChildren: () => import('../feature/layout/routes')
      },
      {
        path: 'form',
        loadChildren: () => import('../feature/form/routes')
      },
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
        redirectTo: 'window',
      },
    ],
    providers: [
      provideUserTheme(),
      provideLayout(
        withDefaultHeaderComponent(),
        withNavigationConfig(APP_NAVIGATION),
        withSettingsMenuItems(
          {
            label: $localize`What's new`,
            icon: { svgIcon: 'format-list-numbered' },
            action: () => inject(ChangelogService).showChangelogDialog()
          },
          LanguageSelectorMenuItemComponent
        )
      ),
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default ROUTES;
