import { Provider } from '@angular/core';
import { UPDATE_AVAILABLE_EVENT } from '../src/lib/service-worker-update-dialog/service-worker-update-dialog.component';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  {
    provide: UPDATE_AVAILABLE_EVENT,
    useValue: {
      type: 'VERSION_READY',
      currentVersion: { hash: 'a1b2c3d4' },
      latestVersion: { hash: 'e5f6a7b8' },
    },
  },
];
