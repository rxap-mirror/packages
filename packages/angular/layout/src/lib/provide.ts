import { Provider } from '@angular/core';
import { coerceArray } from '@rxap/utilities';
import { NavigationService } from './navigation.service';
import { NavigationWithInserts } from './navigation/navigation-item';
import {
  RXAP_NAVIGATION_CONFIG,
  RXAP_NAVIGATION_CONFIG_INSERTS,
  RXAP_RELEASE_INFO_MODULE,
  RXAP_SETTINGS_MENU_ITEM,
  RXAP_SETTINGS_MENU_ITEM_COMPONENT,
} from './tokens';
import {
  ReleaseInfoModule,
  SettingsMenuItem,
  SettingsMenuItemComponent,
} from './types';


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

export function provideSettingsMenuItems(...items: Array<SettingsMenuItemComponent | SettingsMenuItem>): Provider[] {
  return [
    ...items.filter((item): item is SettingsMenuItemComponent => typeof item === 'function').map(component => (
      {
        provide: RXAP_SETTINGS_MENU_ITEM_COMPONENT,
        useValue: component,
        multi: true,
      }
    )),
    ...items.filter((item): item is SettingsMenuItem => typeof item !== 'function').map(item => (
      {
        provide: RXAP_SETTINGS_MENU_ITEM,
        useValue: item,
        multi: true,
      }
    )),
  ];
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
