import { Provider } from '@angular/core';
import { coerceArray } from '@rxap/utilities';
import { NavigationService } from './navigation.service';
import { NavigationWithInserts } from './navigation/navigation-item';
import {
  RXAP_NAVIGATION_CONFIG,
  RXAP_NAVIGATION_CONFIG_INSERTS,
  RXAP_RELEASE_INFO_MODULE,
} from './tokens';
import { ReleaseInfoModule } from './types';


export function ProvideNavigationConfig(
  config: NavigationWithInserts | (() => NavigationWithInserts),
  ...additionalProviders: Provider[]
): Provider[] {
  return [
    {
      provide: RXAP_NAVIGATION_CONFIG,
      useValue: config,
    },
    ...additionalProviders,
  ];
}

export function withNavigationService(): Provider {
  return NavigationService;
}

export function withNavigationInserts(inserts: NavigationWithInserts): Provider {
  return {
    provide: RXAP_NAVIGATION_CONFIG_INSERTS,
    useValue: inserts,
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
