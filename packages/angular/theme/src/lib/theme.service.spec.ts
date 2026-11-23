import { MediaMatcher } from '@angular/cdk/layout';
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import { PubSubService, RXAP_TOPICS } from '@rxap/ngx-pub-sub';
import { Subject } from 'rxjs';
import type { Mock } from 'vitest';
import { provideTheme } from './provide';
import { ThemeModeService } from './theme-mode.service';
import { ThemeService } from './theme.service';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const FULL_PALETTE = {
  50: '#000001', 100: '#000002', 200: '#000003', 300: '#000004', 400: '#000005',
  500: '#000006', 600: '#000007', 700: '#000008', 800: '#000009', 900: '#00000a',
  A100: '#00000b', A200: '#00000c', A400: '#00000d', A700: '#00000e',
};

describe('ThemeService', () => {
  let config: Record<string, any>;
  let topics: Record<string, Subject<{ data?: unknown }>>;
  const pubSub = { subscribe: vi.fn(), publish: vi.fn() };
  let darkMode: { toggleTheme: Mock; setTheme: Mock; darkMode: () => boolean };

  const body = () => document.body;
  const create = () => TestBed.inject(ThemeService);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    localStorage.clear();
    document.body.className = '';
    document.body.removeAttribute('style');
    config = {};
    topics = {};
    pubSub.publish.mockReset();
    pubSub.subscribe.mockReset().mockImplementation((topic: string) => (topics[topic] ??= new Subject()));
    darkMode = { toggleTheme: vi.fn(), setTheme: vi.fn(), darkMode: () => false };
    TestBed.configureTestingModule({
      providers: [
        { provide: MediaMatcher, useValue: { matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) } },
        {
          provide: ConfigService,
          useValue: {
            get: (k: string, d?: unknown) => (k in config ? clone(config[k]) : d),
            getOrThrow: (k: string) => {
              const v = k.split('.').reduce((o, p) => o?.[p], config as any) ?? config[k];
              if (v === undefined) throw new Error('missing ' + k);
              return clone(v);
            },
          },
        },
        { provide: PubSubService, useValue: pubSub },
        { provide: ThemeModeService, useValue: darkMode },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete (window as any).__rxap__;
  });

  it('reads initial state from the body', () => {
    body().style.setProperty('--theme-name', 'blue');
    body().style.setProperty('--font-family', 'var(--font-family-serif)');
    body().classList.add('density-2');
    const s = create();
    expect(s.themeName()).toBe('blue');
    expect(s.typography()).toBe('serif');
    expect(s.density()).toBe(-2);
  });

  it('defaults when nothing is applied', () => {
    const s = create();
    expect([s.themeName(), s.typography(), s.density()]).toEqual(['default', 'default', 0]);
  });

  it('delegates dark mode', () => {
    const s = create();
    s.toggleDarkTheme();
    s.setDarkTheme(true, false, false);
    s.setDarkTheme(false);
    expect(darkMode.toggleTheme).toHaveBeenCalled();
    expect(darkMode.setTheme).toHaveBeenNthCalledWith(1, 'dark', false);
    expect(darkMode.setTheme).toHaveBeenNthCalledWith(2, 'light', true);
  });

  describe('density', () => {
    it('sets, stores and publishes', () => {
      const s = create();
      s.setDensity(-2);
      expect(s.density()).toBe(-2);
      expect(body().classList.contains('density-2')).toBe(true);
      expect(localStorage.getItem('rxap-theme-density')).toBe('-2');
      expect(pubSub.publish).toHaveBeenCalledWith(RXAP_TOPICS.theme.density.changed, -2);
      s.setDensity(-1);
      expect(body().classList.contains('density-2')).toBe(false);
      expect(body().classList.contains('density-1')).toBe(true);
    });

    it('silent and unpublished modes', () => {
      const s = create();
      s.setDensity(-1, true);
      expect(localStorage.getItem('rxap-theme-density')).toBeNull();
      s.setDensity(-2, false, false);
      expect(localStorage.getItem('rxap-theme-density')).toBe('-2');
      expect(pubSub.publish).not.toHaveBeenCalled();
    });

    it('restores valid values only', () => {
      const s = create();
      expect(s.restoreDensity()).toBeNull();
      localStorage.setItem('rxap-theme-density', '-9');
      expect(s.restoreDensity()).toBeNull();
      localStorage.setItem('rxap-theme-density', '-3');
      expect(s.restoreDensity()).toBe(-3);
      expect(s.density()).toBe(-3);
    });

    it('density 0 removes all density classes', () => {
      const s = create();
      s.setDensity(-1);
      s.applyDensity(0);
      expect(body().className).not.toMatch(/density/);
    });
  });

  describe('typography', () => {
    it('sets, stores, publishes and restores', () => {
      const s = create();
      s.setTypography('serif');
      expect(s.typography()).toBe('serif');
      expect(body().style.getPropertyValue('--font-family')).toBe('var(--font-family-serif)');
      expect(localStorage.getItem('rxap-theme-typography')).toBe('serif');
      expect(pubSub.publish).toHaveBeenCalledWith(RXAP_TOPICS.theme.typography.changed, 'serif');
      localStorage.setItem('rxap-theme-typography', 'mono');
      expect(s.restoreTypography()).toBe('mono');
      expect(s.typography()).toBe('mono');
      localStorage.clear();
      expect(s.restoreTypography()).toBeNull();
    });

    it('does not publish when disabled or silent', () => {
      const s = create();
      s.setTypography('a', false, false);
      s.setTypography('b', true);
      expect(pubSub.publish).not.toHaveBeenCalled();
      expect(localStorage.getItem('rxap-theme-typography')).toBe('a');
    });
  });

  describe('themes', () => {
    beforeEach(() => {
      config['colorPalettes'] = {
        full: { color: FULL_PALETTE },
        computed: { base: '#3f51b5', algorithm: 'buckner' },
        partial: { base: '#3f51b5', color: { 500: '#123456' } },
        empty: {},
      };
      config['themes'] = {
        blue: {
          primaryColor: { color: FULL_PALETTE },
          accentColor: { base: '#ff0000' },
          warnColor: { color: FULL_PALETTE },
          density: -1,
          typography: 'serif',
        },
        plain: {},
      };
    });

    it('applies colors, density and typography of a theme', () => {
      const s = create();
      s.setTheme('blue');
      expect(body().style.getPropertyValue('--theme-name')).toBe('blue');
      expect(body().style.getPropertyValue('--primary-500')).toBe('#000006');
      expect(body().style.getPropertyValue('--warn-50')).toBe('#000001');
      expect(body().style.getPropertyValue('--accent-500')).toBe('#ff0000');
      expect(body().classList.contains('density-1')).toBe(true);
      expect(s.themeName()).toBe('blue');
      expect(s.density()).toBe(-1);
      expect(s.typography()).toBe('serif');
      expect(localStorage.getItem('rxap-theme-name')).toBe('blue');
      expect(pubSub.publish).toHaveBeenCalledWith(RXAP_TOPICS.theme.preset.changed, 'blue');
    });

    it('applies a theme without any settings', () => {
      const s = create();
      s.setTheme('plain', true, false);
      expect(s.themeName()).toBe('plain');
      expect(pubSub.publish).not.toHaveBeenCalled();
    });

    it('throws for an unknown theme', () => {
      expect(() => create().setTheme('nope')).toThrow();
    });

    it('resets to default', () => {
      const s = create();
      s.setTheme('blue');
      s.setTheme('default');
      expect(body().style.getPropertyValue('--primary-500')).toBe('');
      expect(body().style.getPropertyValue('--theme-name')).toBe('');
      expect(s.themeName()).toBe('default');
      expect(s.density()).toBe(0);
      expect(s.typography()).toBe('default');
    });

    it('restores the theme name from storage', () => {
      const s = create();
      expect(s.restoreThemeName()).toBeNull();
      localStorage.setItem('rxap-theme-name', 'blue');
      expect(s.restoreThemeName()).toBe('blue');
      expect(s.themeName()).toBe('blue');
    });

    it('lists available themes, palettes and typographies', () => {
      const s = create();
      expect(s.getAvailableThemes()).toEqual(['default', 'blue', 'plain']);
      expect(s.getAvailableColorPalettes()).toEqual(['default', 'full', 'computed', 'partial', 'empty']);
      delete config['themes'];
      delete config['colorPalettes'];
      expect(s.getAvailableThemes()).toBeNull();
      expect(s.getAvailableColorPalettes()).toBeNull();
      expect(s.getAvailableTypographies()).toBeNull();
    });

    it('lists typographies from root css variables', () => {
      config['typographies'] = true;
      const rule = { selectorText: ':root', style: ['--font-family-serif', '--font-family-mono', '--other'] };
      const sheets = [
        { href: null, cssRules: [rule, { selectorText: 'body', style: ['--font-family-no'] }] },
        { href: window.location.origin + '/a.css', cssRules: undefined },
        { href: 'https://cdn.example.com/x.css', cssRules: [rule] },
      ];
      vi.spyOn(document, 'styleSheets', 'get').mockReturnValue(sheets as any);
      expect(create().getAvailableTypographies()).toEqual(['mono', 'serif']);
    });

    it('builds color palettes', () => {
      const s = create();
      expect(s.getColorPalette('full')).toEqual(FULL_PALETTE);
      expect(Object.keys(s.getColorPalette('computed'))).toHaveLength(14);
      expect(() => s.getColorPalette('empty')).toThrow(/neither a base nor a color/);
      expect(() => s.getColorPalette('missing')).toThrow();
    });

    it('completes a partial palette from the base color', () => {
      const palette = create().getColorPalette('partial');
      expect(palette[500]).toBe('#123456');
      expect(Object.keys(palette)).toHaveLength(14);
    });
  });

  describe('restore', () => {
    it('restores from storage and syncs via pubsub with debounce', () => {
      config['themes'] = { blue: {} };
      localStorage.setItem('rxap-theme-name', 'blue');
      localStorage.setItem('rxap-theme-density', '-1');
      localStorage.setItem('rxap-theme-typography', 'serif');
      const s = create();
      s.restore();
      expect(s.themeName()).toBe('blue');
      expect(s.density()).toBe(-1);
      expect(s.typography()).toBe('serif');

      s.restore(); // second call must not subscribe again
      expect(pubSub.subscribe).toHaveBeenCalledTimes(3);

      topics[RXAP_TOPICS.theme.density.restore].next({ data: -2 });
      topics[RXAP_TOPICS.theme.typography.restore].next({ data: 'mono' });
      topics[RXAP_TOPICS.theme.preset.restore].next({ data: 'blue' });
      topics[RXAP_TOPICS.theme.preset.restore].next({});
      vi.advanceTimersByTime(1000);
      expect(s.density()).toBe(-2);
      expect(s.typography()).toBe('mono');
      expect(pubSub.publish).not.toHaveBeenCalled();
    });

    it('uses custom storage keys from the global namespace', () => {
      (window as any).__rxap__ = {
        ngx: { theme: { name: { key: 'n' }, density: { key: 'd' }, typography: { key: 't' } } },
      };
      const s = create();
      s.setTypography('x');
      s.setDensity(-1);
      config['themes'] = { y: {} };
      s.setTheme('y');
      expect(localStorage.getItem('t')).toBe('x');
      expect(localStorage.getItem('d')).toBe('-1');
      expect(localStorage.getItem('n')).toBe('y');
    });

    it('restoreDensity reads the custom density storage key', () => {
      (window as any).__rxap__ = { ngx: { theme: { density: { key: 'd' } } } };
      localStorage.setItem('d', '-2');
      localStorage.setItem('rxap-theme-density', '-1');
      const s = create();
      expect(s.restoreDensity()).toBe(-2);
      expect(s.density()).toBe(-2);
    });

    it('provideTheme restores on app initialisation', async () => {
      TestBed.resetTestingModule();
      localStorage.setItem('rxap-theme-typography', 'mono');
      TestBed.configureTestingModule({
        providers: [
          provideTheme(),
          { provide: MediaMatcher, useValue: { matchMedia: () => ({}) } },
          { provide: ConfigService, useValue: { get: (_k: string, d: unknown) => d } },
          { provide: PubSubService, useValue: pubSub },
          { provide: ThemeModeService, useValue: darkMode },
        ],
      });
      await TestBed.inject(ApplicationInitStatus).donePromise;
      expect(TestBed.inject(ThemeService).typography()).toBe('mono');
    });
  });
});
