import { EnvironmentProviders } from '@angular/core';
import { provideRouter } from '@angular/router';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: EnvironmentProviders[] = [
  // the status indicator navigates to the status check page if a service is not available
  provideRouter([]),
];
