import { ComponentType } from '@angular/cdk/portal';
import { InjectionToken } from '@angular/core';
import {
  LogoConfig,
  NavigationConfig,
} from '@rxap/config';
import { staticDataSource } from '@rxap/data-source';
import {
  DataSource,
  MethodWithParameters,
} from '@rxap/pattern';
import { NavigationWithInserts } from './navigation/navigation-item';
import {
  DefaultHeaderItemComponent,
  ExternalApp,
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

export const RXAP_EXTERNAL_APP_FILTER = new InjectionToken<MethodWithParameters<ExternalApp[], ExternalApp[]>>('rxap/layout/app-config-filter');
export const EXTRACT_USERNAME_FROM_PROFILE = new InjectionToken<ExtractUsernameFromProfileFn>(
  'extract-username-from-profile',
  {
    providedIn: 'root',
    factory: () => (profile: any) => (
                                       profile ? profile.displayName || profile.username || profile.email || profile.name : null
                                     ) || null,
  },
);

export const RXAP_USER_PROFILE_DATA_SOURCE = new InjectionToken<DataSource>('rxap/layout/user-profile-data-source', {
  providedIn: 'root',
  factory: () => staticDataSource(null),
});

export const RXAP_EXTERNAL_APP = new InjectionToken<ExternalApp>('rxap/layout/external-app');

export const RXAP_RELEASE_INFO_MODULE = new InjectionToken<ReleaseInfoModule>('rxap/layout/release-info-module');

export const RXAP_SETTINGS_MENU_ITEM_COMPONENT = new InjectionToken<Array<SettingsMenuItemComponent | (() => Promise<SettingsMenuItemComponent>)>>('rxap/layout/settings-menu-item-component');

export const RXAP_DEFAULT_HEADER_ITEM_COMPONENT = new InjectionToken<Array<DefaultHeaderItemComponent | (() => Promise<DefaultHeaderItemComponent>)>>('rxap/layout/default-header-item-component');

export const RXAP_SETTINGS_MENU_ITEM = new InjectionToken<SettingsMenuItem>('rxap/layout/settings-menu-item');

export const RXAP_NAVIGATION_LAYOUT_CONFIG_DEFAULTS = new InjectionToken<Omit<NavigationConfig, 'apps'>>('rxap/layout/navigation-config/defaults');

export const RXAP_LOGO_CONFIG_DEFAULTS = new InjectionToken<LogoConfig>('rxap/layout/logo-config/defaults');
