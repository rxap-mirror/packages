import { provideRouter } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationComponent } from '@rxap/layout';
import docJson from '../documentation.json';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ProvideIconAssetPath } from '@rxap/icon';
import { ProvideConfig } from '@rxap/config';
import { ProvideEnvironment } from '@rxap/environment';
import { withThemeByClassName } from '@storybook/addon-themes';
import { applicationConfig } from '@storybook/angular';
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
      ProvideConfig(),
      ProvideEnvironment({
        app: 'angular-layout-storybook',
        production: false,
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
    ],
  }),
];
