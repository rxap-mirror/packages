import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ProvideConfig } from '@rxap/config';
import { ProvideEnvironment } from '@rxap/environment';
import { ProvideIconAssetPath } from '@rxap/icon';
import { OpenApiConfigService } from '@rxap/open-api';
import { withThemeByClassName } from '@storybook/addon-themes';
import { applicationConfig, Preview } from '@storybook/angular';
import '@angular/localize/init';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

OpenApiConfigService.InsertServer({
  url: 'http://localhost:3168/api',
}, 0, 'backend');

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    parentSelector: 'body',
  }),
  applicationConfig({
    providers: [
      provideHttpClient(),
      ProvideIconAssetPath([ 'mdi.svg', 'custom.svg' ]),
      provideAnimations(),
      ProvideConfig(),
      ProvideEnvironment({
        app: 'components-storybook',
        production: false,
      }),
      importProvidersFrom(RouterTestingModule),
    ],
  }),
];

const preview: Preview = {
  decorators,
};

export default preview;
