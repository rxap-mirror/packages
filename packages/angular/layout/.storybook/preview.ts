import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { faker } from '@faker-js/faker';
import { ProvideConfig } from '@rxap/config';
import { ProvideEnvironment } from '@rxap/environment';
import { ProvideIconAssetPath } from '@rxap/icon';
import { NavigationComponent } from '@rxap/layout';
import { ProvidePubSub } from '@rxap/ngx-pub-sub';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { withThemeByClassName } from '@storybook/addon-themes';
import { applicationConfig } from '@storybook/angular';
import docJson from '../documentation.json';
import '@angular/localize/init';

setCompodocJson(docJson);

export const decorators = [
  withThemeByClassName({
    themes: {
      light: '',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
  applicationConfig({
    providers: [
      importProvidersFrom(HttpClientModule, RouterTestingModule),
      ProvideIconAssetPath(['mdi.svg', 'custom.svg']),
      provideNoopAnimations(),
      ProvideConfig({
        navigation: {
          apps: [
            {
              label: faker.company.name(),
              routerLink: [ '/', 'link-1' ],
            }
          ]
        }
      }),
      ProvideEnvironment({
        app: 'angular-layout-storybook',
        name: 'production',
        production: true,
        serviceWorker: false,
        release: 'v' + faker.system.semver(),
        commit: faker.git.commitSha({ length: 7 }),
        timestamp: faker.date.past().toISOString(),
        branch: faker.git.branch(),
        tier: 'production',
      }),
      provideRouter([
        {
          path: 'link-1',
          children: [
            {
              path: 'sub-1',
              children: [
                {
                  path: 'sub-sub-1',
                  children: [
                    {
                      path: 'sub-sub-sub-1',
                      component: NavigationComponent,
                    },
                    {
                      path: 'sub-sub-sub-2',
                      component: NavigationComponent,
                    },
                    {
                      path: 'sub-sub-sub-3',
                      component: NavigationComponent,
                    },
                  ],
                },
                {
                  path: 'sub-sub-2',
                  component: NavigationComponent,
                },
                {
                  path: 'sub-sub-3',
                  component: NavigationComponent,
                },
              ],
            },
            {
              path: 'sub-2',
              component: NavigationComponent,
            },
            {
              path: 'sub-3',
              component: NavigationComponent,
            },
          ],
        },
        {
          path: 'link-2',
          component: NavigationComponent,
        },
        {
          path: 'link-3',
          component: NavigationComponent,
        },
        {
          path: 'link-4',
          children: [
            {
              path: 'sub-1',
              component: NavigationComponent,
            },
            {
              path: 'sub-2',
              component: NavigationComponent,
            },
            {
              path: 'sub-3',
              component: NavigationComponent,
            },
          ],
        },
        {
          path: 'link-5',
          component: NavigationComponent,
        },
      ]),
      ProvidePubSub(),
    ],
  }),
];
