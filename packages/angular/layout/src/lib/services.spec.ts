import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { FooterService } from './footer.service';
import { HeaderService } from './header.service';
import { LogoService } from './logo.service';
import {
  EXTRACT_USERNAME_FROM_PROFILE,
  RXAP_FOOTER_COMPONENT,
  RXAP_HEADER_COMPONENT,
  RXAP_LOGO_CONFIG,
  RXAP_LOGO_CONFIG_DEFAULTS,
  RXAP_USER_PROFILE_DATA_SOURCE,
} from './tokens';

@Component({ standalone: true, template: '' })
class A {}
@Component({ standalone: true, template: '' })
class B {}

describe('LogoService', () => {
  const config = (value?: any) => ({ get: jest.fn((_k: string, def: any) => value ?? def) });

  it('uses defaults', () => {
    TestBed.configureTestingModule({ providers: [{ provide: ConfigService, useValue: config() }] });
    const s = TestBed.inject(LogoService);
    expect(s.src()).toBe('logo.png');
    expect(s.width()).toBe(192);
    expect(s.height()).toBeUndefined();
  });

  it('prefers the token, then config, then configured defaults', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: ConfigService, useValue: config() }, { provide: RXAP_LOGO_CONFIG_DEFAULTS, useValue: { src: 'd.png', width: 1 } }],
    });
    expect(TestBed.inject(LogoService).src()).toBe('d.png');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: ConfigService, useValue: config({ src: 'c.png', width: 2, height: 3 }) }] });
    const c = TestBed.inject(LogoService);
    expect([c.src(), c.width(), c.height()]).toEqual(['c.png', 2, 3]);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: ConfigService, useValue: config() }, { provide: RXAP_LOGO_CONFIG, useValue: { src: 't.png', width: 9 } }] });
    expect(TestBed.inject(LogoService).src()).toBe('t.png');
  });
});

describe.each([
  ['HeaderService', HeaderService, RXAP_HEADER_COMPONENT],
  ['FooterService', FooterService, RXAP_FOOTER_COMPONENT],
] as const)('%s', (_name, Service, token) => {
  const create = (providers: any[] = []) => {
    TestBed.configureTestingModule({ providers: [Service, ...providers] });
    return TestBed.inject(Service as any) as HeaderService;
  };

  it('starts without portals', () => {
    const s = create();
    expect(s.portals()).toEqual([]);
    expect(s.portalCount()).toBe(0);
  });

  it('creates portals for provided components', () => {
    const s = create([{ provide: token, useValue: [A, B] }]);
    expect(s.portalCount()).toBe(2);
    expect(s.portals()[0]).toBeInstanceOf(ComponentPortal);
  });

  it('pushes and removes portals, refusing duplicates', () => {
    const s = create();
    const p = new ComponentPortal(A);
    s.pushPortal(p);
    s.pushPortal(p);
    expect(s.portalCount()).toBe(1);
    s.removePortal(new ComponentPortal(B));
    expect(s.portalCount()).toBe(1);
    s.removePortal(p);
    expect(s.portalCount()).toBe(0);
    void TemplatePortal;
  });
});

describe('tokens', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('extracts a username from the profile', () => {
    const fn = TestBed.inject(EXTRACT_USERNAME_FROM_PROFILE);
    expect(fn(null as any)).toBeNull();
    expect(fn({ displayName: 'D', username: 'u' } as any)).toBe('D');
    expect(fn({ username: 'u' } as any)).toBe('u');
    expect(fn({ email: 'e' } as any)).toBe('e');
    expect(fn({ name: 'n' } as any)).toBe('n');
    expect(fn({} as any)).toBeNull();
  });

  it('has a static null user profile data source', () => {
    expect(TestBed.inject(RXAP_USER_PROFILE_DATA_SOURCE)).toBeTruthy();
  });
});

describe('ExternalAppsService', () => {
  const apps = [
    { id: 'a', href: 'http://a', routerLink: ['/a'] },
    { id: 'h', href: 'http://h', hidden: true },
    { id: 'n' },
  ];
  const setup = async (opts: { production?: boolean; locale?: string; filters?: any[]; extra?: any[] } = {}) => {
    const { ExternalAppsService } = await import('./external-apps.service');
    const { LOCALE_ID } = await import('@angular/core');
    const { RXAP_EXTERNAL_APP, RXAP_EXTERNAL_APP_FILTER } = await import('./tokens');
    TestBed.configureTestingModule({
      providers: [
        ExternalAppsService,
        { provide: ConfigService, useValue: { get: (_k: string, d: any) => apps ?? d } },
        { provide: LOCALE_ID, useValue: opts.locale ?? 'de-DE' },
        { provide: RXAP_ENVIRONMENT, useValue: { production: !!opts.production } },
        ...(opts.filters ?? []).map((f) => ({ provide: RXAP_EXTERNAL_APP_FILTER, useValue: f, multi: true })),
        ...(opts.extra ?? []).map((e) => ({ provide: RXAP_EXTERNAL_APP, useValue: e, multi: true })),
      ],
    });
    return TestBed.inject(ExternalAppsService);
  };

  it('looks up apps', async () => {
    const s = await setup();
    expect(s.hasApp('a')).toBe(true);
    expect(s.hasApp('zz')).toBe(false);
    expect(s.getApp('zz')).toBeNull();
    const app = s.getApp('a')!;
    expect(app).toEqual(apps[0]);
    expect(app).not.toBe(apps[0]);
  });

  it('builds urls and router links', async () => {
    const s = await setup();
    expect(s.getAppUrl('a', 'p')).toBe('http://a/p');
    expect(s.getAppUrl('n', 'p')).toBeNull();
    expect(s.getAppUrl('zz', 'p')).toBeNull();
    expect(s.getAppRouterLink('a', 'p')).toEqual(['/a', 'p']);
    expect(s.getAppRouterLink('n', 'p')).toBeNull();
    expect(s.getAppUrlOrThrow('a', 'p')).toBe('http://a/p');
    expect(() => s.getAppUrlOrThrow('n', 'p')).toThrow('Could not find url');
    expect(s.getAppRouterLinkOrThrow('a', 'p')).toEqual(['/a', 'p']);
    expect(() => s.getAppRouterLinkOrThrow('n', 'p')).toThrow('Could not find router link');
  });

  it('uses the locale prefix in production', async () => {
    const s = await setup({ production: true });
    expect(s.getAppUrl('a', 'p')).toBe('http://a/de/p');
  });

  it('lists visible apps, applies filters and stores the active list', async () => {
    const filter = { call: jest.fn(async (l: any[]) => l.filter((a) => a.id !== 'n')) };
    const s = await setup({ production: true, filters: [filter], extra: [{ id: 'x', href: 'http://x' }] });
    const list = await s.getAppList();
    expect(list.map((a) => a.id)).toEqual(['x', 'a']);
    expect(list[1].href).toBe('http://a/de');
    expect(s.activeAppList()).toEqual(list);
    expect(filter.call).toHaveBeenCalled();
  });

  it('navigate clicks a link for known apps only', async () => {
    const s = await setup();
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    s.navigate('a', 'p');
    expect(click).toHaveBeenCalledTimes(1);
    s.navigate('n', 'p');
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });
});
