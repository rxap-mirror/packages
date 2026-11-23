import { Provider } from '@angular/core';
import { staticDataSource } from '@rxap/data-source';
import { DefaultHeaderService } from '../src/lib/default-header/default-header.service';
import { ExternalAppsService } from '../src/lib/external-apps.service';
import { FooterService } from '../src/lib/footer.service';
import { HeaderService } from '../src/lib/header.service';
import { LayoutService } from '../src/lib/layout.service';
import { NavigationService } from '../src/lib/navigation.service';
import {
  RXAP_EXTERNAL_APP,
  RXAP_LOGO_CONFIG,
  RXAP_NAVIGATION_CONFIG,
  RXAP_NAVIGATION_LAYOUT_CONFIG_DEFAULTS,
  RXAP_RELEASE_INFO_MODULE,
  RXAP_SETTINGS_MENU_ITEM,
  RXAP_USER_PROFILE_DATA_SOURCE,
} from '../src/lib/tokens';

const LOGO_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="32" viewBox="0 0 96 32">' +
    '<rect width="32" height="32" rx="8" fill="#1976d2"/>' +
    '<text x="42" y="22" font-family="Roboto, sans-serif" font-size="18" font-weight="500" fill="#616161">RxAP</text>' +
    '</svg>',
  );

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  LayoutService,
  HeaderService,
  FooterService,
  NavigationService,
  ExternalAppsService,
  DefaultHeaderService,
  // the sidenav is pinned and not fixed to the viewport, so that it is rendered inside the canvas of the styleguide
  {
    provide: RXAP_NAVIGATION_LAYOUT_CONFIG_DEFAULTS,
    useValue: {
      collapsable: true,
      pinned: true,
      opened: true,
      mode: 'side',
      fixedInViewport: false,
    },
  },
  {
    provide: RXAP_NAVIGATION_CONFIG,
    useValue: [
      { label: 'Dashboard', routerLink: '/dashboard', icon: 'dashboard' },
      { label: 'Users', routerLink: '/users', icon: 'group' },
      { divider: true, title: 'Administration' },
      { label: 'Settings', routerLink: '/settings', icon: 'settings' },
    ],
  },
  {
    provide: RXAP_LOGO_CONFIG,
    useValue: { src: LOGO_SVG, width: 96, height: 32 },
  },
  {
    provide: RXAP_USER_PROFILE_DATA_SOURCE,
    useValue: staticDataSource({
      displayName: 'Jane Doe',
      email: 'jane.doe@example.com',
    }),
  },
  {
    provide: RXAP_EXTERNAL_APP,
    multi: true,
    useValue: { id: 'docs', label: 'Documentation', href: 'https://example.com/docs', target: '_blank', icon: 'menu_book' },
  },
  {
    provide: RXAP_EXTERNAL_APP,
    multi: true,
    useValue: { id: 'admin', label: 'Admin', href: 'https://example.com/admin', icon: 'admin_panel_settings' },
  },
  {
    provide: RXAP_RELEASE_INFO_MODULE,
    multi: true,
    useValue: { name: '@rxap/layout', version: '1.4.2', hash: '3f2a9c1' },
  },
  {
    provide: RXAP_RELEASE_INFO_MODULE,
    multi: true,
    useValue: { name: '@rxap/material-directives', version: '1.4.2', hash: '3f2a9c1' },
  },
  {
    provide: RXAP_SETTINGS_MENU_ITEM,
    multi: true,
    useValue: { label: 'Profile', icon: 'person', action: () => undefined },
  },
];
