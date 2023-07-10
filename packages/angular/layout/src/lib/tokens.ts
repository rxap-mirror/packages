import { InjectionToken } from '@angular/core';
import { LogoConfig } from './types';
import { NavigationWithInserts } from './navigation/navigation-item';

export const RXAP_NAVIGATION_CONFIG = new InjectionToken<NavigationWithInserts | (() => NavigationWithInserts)>(
  'rxap/layout/navigation-config');
export const RXAP_NAVIGATION_CONFIG_INSERTS = new InjectionToken<Record<string, NavigationWithInserts>>(
  'rxap/layout/navigation-config-inserts');

export const RXAP_FOOTER_COMPONENT = new InjectionToken('rxap/layout/footer-component');
export const RXAP_HEADER_COMPONENT = new InjectionToken('rxap/layout/header-component');
export const RXAP_LOGO_CONFIG = new InjectionToken<LogoConfig>('rxap/layout/logo-config');
export const RXAP_LAYOUT_APPS_GRID = new InjectionToken('rxap/layout/apps-grid');
