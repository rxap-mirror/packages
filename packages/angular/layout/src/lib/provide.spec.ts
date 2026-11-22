import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideExternalApps,
  provideLayout,
  withDefaultHeaderComponent,
  withDefaultHeaderItems,
  withFooterComponents,
  withHeaderComponents,
  withNavigationConfig,
  withNavigationInserts,
  withReleaseInfoModules,
  withSettingsMenuItems,
  withUserProfileDataSource,
} from './provide';
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

@Component({ standalone: true, template: '' })
class C {}

const find = (providers: any[], token: any) => providers.filter((p) => p && p.provide === token);

describe('provide helpers', () => {
  it('provideLayout appends additional providers', () => {
    const extra = { provide: 'x', useValue: 1 };
    const list = provideLayout(extra);
    expect(list).toHaveLength(5);
    expect(list).toContain(extra);
  });

  it('provideExternalApps', () => {
    const list = provideExternalApps({ id: 'a' } as any, { id: 'b' } as any);
    expect(find(list as any[], RXAP_EXTERNAL_APP).map((p) => p.useValue.id)).toEqual(['a', 'b']);
    expect(find(list as any[], RXAP_EXTERNAL_APP).every((p) => p.multi)).toBe(true);
  });

  it('withNavigationConfig / Inserts', () => {
    const cfg = [] as any;
    expect(find(withNavigationConfig(cfg) as any[], RXAP_NAVIGATION_CONFIG)[0].useValue).toBe(cfg);
    const ins = {};
    expect(withNavigationInserts(ins)[0]).toEqual({ provide: RXAP_NAVIGATION_CONFIG_INSERTS, useValue: ins });
  });

  it('withSettingsMenuItems splits components and items', () => {
    const item = { id: 'i' } as any;
    const list = withSettingsMenuItems(C as any, item) as any[];
    expect(find(list, RXAP_SETTINGS_MENU_ITEM_COMPONENT)[0].useValue).toBe(C);
    expect(find(list, RXAP_SETTINGS_MENU_ITEM)[0].useValue).toBe(item);
  });

  it('withDefaultHeaderItems, withReleaseInfoModules', () => {
    expect(withDefaultHeaderItems(C as any)[0]).toEqual({ provide: RXAP_DEFAULT_HEADER_ITEM_COMPONENT, useValue: C, multi: true });
    const m = {} as any;
    expect(withReleaseInfoModules(m)[0]).toEqual({ provide: RXAP_RELEASE_INFO_MODULE, useValue: m, multi: true });
  });

  it('header and footer components', () => {
    expect(withHeaderComponents([C])[0]).toEqual({ provide: RXAP_HEADER_COMPONENT, useValue: C, multi: true });
    expect(withFooterComponents([C])[0]).toEqual({ provide: RXAP_FOOTER_COMPONENT, useValue: C });
    expect((withDefaultHeaderComponent() as any).provide).toBe(RXAP_HEADER_COMPONENT);
  });

  it('withUserProfileDataSource', () => {
    class DS {}
    expect(withUserProfileDataSource(DS as any)).toEqual({ provide: RXAP_USER_PROFILE_DATA_SOURCE, useExisting: DS });
    expect(withUserProfileDataSource(DS as any, true)).toEqual({ provide: RXAP_USER_PROFILE_DATA_SOURCE, useClass: DS });
    void TestBed;
  });
});
