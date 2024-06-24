import { ComponentType } from '@angular/cdk/portal';
import { InjectionToken } from '@angular/core';
import { LogoConfig } from '@rxap/config';
import { MethodWithParameters } from '@rxap/pattern';
import { NavigationWithInserts } from './navigation/navigation-item';
import {
  ExternalApps,
  ExtractUsernameFromProfileFn,
  ReleaseInfoModule,
  SettingsMenuItem,
  SettingsMenuItemComponent,
} from './types';

export const RXAP_NAVIGATION_CONFIG = new InjectionToken<NavigationWithInserts | (() => NavigationWithInserts)>(
  'rxap/layout/navigation-config');
export const RXAP_NAVIGATION_CONFIG_INSERTS = new InjectionToken<Record<string, NavigationWithInserts>>(
  'rxap/layout/navigation-config-inserts');

export const RXAP_FOOTER_COMPONENT = new InjectionToken<ComponentType<unknown>>('rxap/layout/footer-component');
export const RXAP_HEADER_COMPONENT = new InjectionToken<ComponentType<unknown>>('rxap/layout/header-component');
export const RXAP_LOGO_CONFIG = new InjectionToken<LogoConfig>('rxap/layout/logo-config');
export const RXAP_LAYOUT_APPS_GRID = new InjectionToken('rxap/layout/apps-grid');

export const RXAP_EXTERNAL_APP_FILTER = new InjectionToken<MethodWithParameters<ExternalApps[], ExternalApps[]>>('rxap/layout/app-config-filter');
export const EXTRACT_USERNAME_FROM_PROFILE = new InjectionToken<ExtractUsernameFromProfileFn>(
  'extract-username-from-profile',
  {
    providedIn: 'root',
    factory: () => (profile: any) => (
                                       profile ? profile.username ?? profile.email ?? profile.name : null
                                     ) ?? null,
  },
);

export const RXAP_RELEASE_INFO_MODULE = new InjectionToken<ReleaseInfoModule>('rxap/layout/release-info-module');

export const RXAP_SETTINGS_MENU_ITEM_COMPONENT = new InjectionToken<SettingsMenuItemComponent>('rxap/layout/settings-menu-item-component');

export const RXAP_SETTINGS_MENU_ITEM = new InjectionToken<SettingsMenuItem>('rxap/layout/settings-menu-item');
