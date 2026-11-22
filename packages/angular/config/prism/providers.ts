import { Provider } from '@angular/core';
import { RXAP_CONFIG } from '../src/lib/tokens';

/**
 * Providers of the ng-prism styleguide host. The styleguide does not load a config.json, so the
 * ConfigService of the components gets an empty config instead of throwing `config not available`.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  { provide: RXAP_CONFIG, useValue: {} },
];
