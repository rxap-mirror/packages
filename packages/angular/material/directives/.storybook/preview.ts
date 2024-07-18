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
    parentSelector: 'body',
  }),
  applicationConfig({
    providers: [
      importProvidersFrom(HttpClientModule),
      ProvideIconAssetPath(['mdi.svg', 'custom.svg']),
      provideNoopAnimations(),
      ProvideConfig(),
      ProvideEnvironment({
        app: 'angular-material-directives-storybook',
        production: false,
      }),
    ],
  }),
];
