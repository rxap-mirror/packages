import { Provider } from '@angular/core';
import { coerceArray } from '@rxap/utilities';
import { NavigationWithInserts } from './navigation/navigation-item';
import {
  RXAP_NAVIGATION_CONFIG,
  RXAP_RELEASE_INFO_MODULE,
} from './tokens';
import { ReleaseInfoModule } from './types';


export function ProvideNavigationConfig(config: NavigationWithInserts | (() => NavigationWithInserts)) {
  return {
    provide: RXAP_NAVIGATION_CONFIG,
    useValue: config,
  };
}

export function ProvideReleaseInfoModule(module: ReleaseInfoModule | ReleaseInfoModule[]): Provider[] {
  module = coerceArray(module);
  return module.map(item => (
    {
      provide: RXAP_RELEASE_INFO_MODULE,
      useValue: item,
      multi: true,
    }
  ));
}
