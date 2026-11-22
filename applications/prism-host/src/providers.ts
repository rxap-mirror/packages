import { provideHttpClient } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  provideAppInitializer,
  Provider,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PRISM_LIBRARY_PROVIDERS } from './library-providers';

const PLACEHOLDER_ICON =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>',
  );

/**
 * Providers of the styleguide application. A @Showcase can not declare providers, because the manifest is static.
 * Components that inject a token (e.g. RXAP_ENVIRONMENT) get their providers from the `prism/providers.ts` file
 * of their library, collected in `library-providers.ts`.
 * The ng-prism.config.ts is also loaded in node without the tsconfig paths, therefore the providers
 * must not be added with appProviders in the config.
 */
export const PRISM_HOST_PROVIDERS: Array<Provider | EnvironmentProviders> = [
  provideHttpClient(),
  // the libraries use svg icons that are registered by the consuming application.
  // Every unknown svg icon is resolved to a placeholder
  provideAppInitializer(() => {
    const sanitizer = inject(DomSanitizer);
    inject(MatIconRegistry).addSvgIconResolver(() =>
      sanitizer.bypassSecurityTrustResourceUrl(PLACEHOLDER_ICON),
    );
  }),
  ...PRISM_LIBRARY_PROVIDERS,
];
