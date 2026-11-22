import { Provider } from '@angular/core';
import { RXAP_ENVIRONMENT } from '../src/lib/environment/tokens';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 */
export const PRISM_PROVIDERS: Provider[] = [
  {
    provide: RXAP_ENVIRONMENT,
    useValue: {
      app: 'Demo App',
      name: 'staging',
      production: false,
      serviceWorker: true,
      release: '1.4.2',
      commit: '3f2a9c1',
      timestamp: 1767225600000,
      branch: 'development',
      tag: 'v1.4.2',
    },
  },
];
