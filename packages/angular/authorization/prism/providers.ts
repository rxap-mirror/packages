import {
  EnvironmentProviders,
  inject,
  provideAppInitializer,
  Provider,
} from '@angular/core';
import { AuthorizationService } from '../src/lib/authorization.service';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * The styleguide has no authenticated user. Therefore the permission `prism.granted` is granted statically,
 * every other permission (e.g. `prism.denied`) is missing. The showcases use both to show the permitted and
 * the denied state of a directive.
 */
export const PRISM_PROVIDERS: Array<Provider | EnvironmentProviders> = [
  provideAppInitializer(() => inject(AuthorizationService).setPermissions([ 'prism.granted' ])),
];
