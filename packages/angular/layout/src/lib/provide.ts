import { ComponentType } from '@angular/cdk/portal';
import { Provider } from '@angular/core';
import { DataSource } from '@rxap/pattern';
import { Constructor } from '@rxap/utilities';
import { DefaultHeaderComponent } from './default-header/default-header.component';
import { DefaultHeaderService } from './default-header/default-header.service';
import { ExternalAppsService } from './external-apps.service';
import { FooterService } from './footer.service';
import { HeaderService } from './header.service';
import { LayoutService } from './layout.service';
import { LogoService } from './logo.service';
import { NavigationService } from './navigation.service';
import { NavigationWithInserts } from './navigation/navigation-item';
import {
  RXAP_DEFAULT_HEADER_ITEM_COMPONENT,
  RXAP_EXTERNAL_APP,
  RXAP_FOOTER_COMPONENT,
  RXAP_HEADER_COMPONENT,
  RXAP_NAVIGATION_CONFIG,
  RXAP_NAVIGATION_CONFIG_INSERTS,
  RXAP_RELEASE_INFO_MODULE,
  RXAP_SETTINGS_MENU_ITEM,
  RXAP_SETTINGS_MENU_ITEM_COMPONENT,
  RXAP_USER_PROFILE_DATA_SOURCE,
} from './tokens';
import {
  DefaultHeaderItemComponent,
  ExternalApp,
  ReleaseInfoModule,
  SettingsMenuItem,
  SettingsMenuItemComponent,
} from './types';

export function provideLayout(...additionalProviders: Provider[]): Provider[] {
  return [
    LayoutService,
    LogoService,
    HeaderService,
    FooterService,
    DefaultHeaderService,
    ...additionalProviders,
  ];
}

export function provideExternalApps(...apps: ExternalApp[]): Provider[] {
  return [
    ExternalAppsService,
    ...apps.map(app => (
      {
        provide: RXAP_EXTERNAL_APP,
        useValue: app,
        multi: true,
      }
    ))
  ];
}

export function withNavigationConfig(
  config: NavigationWithInserts | (() => NavigationWithInserts),
): Provider[] {
  return [
    NavigationService,
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

export function withSettingsMenuItems(...items: Array<SettingsMenuItemComponent | (() => Promise<SettingsMenuItemComponent> | SettingsMenuItemComponent) | SettingsMenuItem>): Provider[] {
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

export function withDefaultHeaderItems(...items: Array<DefaultHeaderItemComponent | (() => Promise<DefaultHeaderItemComponent> | DefaultHeaderItemComponent)>): Provider[] {
  return items.map(component => ({
    provide: RXAP_DEFAULT_HEADER_ITEM_COMPONENT,
    useValue: component,
    multi: true,
  }));
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

export function withHeaderComponents(components: Array<ComponentType<unknown>>): Provider[] {
  return components.map(component => (
    {
      provide: RXAP_HEADER_COMPONENT,
      useValue: component,
      multi: true,
    }
  ));
}

export function withFooterComponents(components: Array<ComponentType<unknown>>): Provider[] {
  return components.map(component => (
    {
      provide: RXAP_FOOTER_COMPONENT,
      useValue: component,
    }
  ));
}

export function withDefaultHeaderComponent(): Provider {
  return {
    provide: RXAP_HEADER_COMPONENT,
    useValue: DefaultHeaderComponent,
    multi: true,
  };
}

export function withUserProfileDataSource(dataSource: Constructor<DataSource>, useClass = false): Provider {
  if (useClass) {
    return {
      provide: RXAP_USER_PROFILE_DATA_SOURCE,
      useClass: dataSource
    };
  } else {
    return {
      provide: RXAP_USER_PROFILE_DATA_SOURCE,
      useExisting: dataSource
    };
  }
}
