import {
  NavigationWithInserts,
  RXAP_NAVIGATION_CONFIG,
} from '@rxap/layout';

export function ProvideNavigationConfig(config: NavigationWithInserts | (() => NavigationWithInserts)) {
  return {
    provide: RXAP_NAVIGATION_CONFIG,
    useValue: config,
  };
}
