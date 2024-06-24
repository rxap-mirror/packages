import { Provider } from '@angular/core';
import { coerceArray } from '@rxap/utilities';
import { ExternalAppsService } from './external-apps.service';
import { LayoutService } from './layout.service';
import { LogoService } from './logo.service';
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

export function provideLayout(...additionalProviders: Provider[]): Provider[] {
  return [
    ExternalAppsService,
    LayoutService,
    LogoService,
    NavigationService,
    ...additionalProviders,
  ];
}

export function withNavigationConfig(
  config: NavigationWithInserts | (() => NavigationWithInserts),
): Provider[] {
  return [
    {
      provide: RXAP_NAVIGATION_CONFIG,
      useValue: config,
    },
  ];
}

export function withNavigationInserts(inserts: Record<string, NavigationWithInserts>): Provider[] {
  return [{
    provide: RXAP_NAVIGATION_CONFIG_INSERTS,
    useValue: inserts,
  }];
}

export function withSettingsMenuItems(...items: Array<SettingsMenuItemComponent | SettingsMenuItem>): Provider[] {
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

export function withReleaseInfoModules(...module: ReleaseInfoModule[]): Provider[] {
  return module.map(item => (
    {
      provide: RXAP_RELEASE_INFO_MODULE,
      useValue: item,
      multi: true,
    }
  ));
}
