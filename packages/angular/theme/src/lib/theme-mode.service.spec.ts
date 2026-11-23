import { MediaMatcher } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import { PubSubService, RXAP_TOPICS } from '@rxap/ngx-pub-sub';
import { Subject } from 'rxjs';
import { THEME_SETTING_KEY, ThemeModeService } from './theme-mode.service';

class FakeMediaQuery {
  matches = false;
  listeners = new Set<(e: { matches: boolean }) => void>();
  addEventListener(_: string, l: any) { this.listeners.add(l); }
  removeEventListener(_: string, l: any) { this.listeners.delete(l); }
  emit(matches: boolean) {
    this.matches = matches;
    this.listeners.forEach((l) => l({ matches }));
  }
}

describe('ThemeModeService', () => {
  let mq: FakeMediaQuery;
  let restore$: Subject<{ data?: boolean }>;
  let configValues: Record<string, unknown>;
  const pubSub = { subscribe: vi.fn(), publish: vi.fn() };

  function create() {
    return TestBed.inject(ThemeModeService);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    document.body.className = '';
    mq = new FakeMediaQuery();
    restore$ = new Subject();
    configValues = {};
    pubSub.publish.mockReset();
    pubSub.subscribe.mockReset().mockImplementation((topic: string) => {
      expect(topic).toBe(RXAP_TOPICS.theme.darkMode.restore);
      return restore$.asObservable();
    });
    TestBed.configureTestingModule({
      providers: [
        { provide: MediaMatcher, useValue: { matchMedia: () => mq } },
        { provide: ConfigService, useValue: { get: (k: string, d?: unknown) => configValues[k] ?? d } },
        { provide: PubSubService, useValue: pubSub },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as any).__rxap__;
  });

  it('follows the system preference by default', () => {
    mq.matches = true;
    const service = create();
    expect(service.themeSetting()).toBe('system');
    expect(service.activeTheme()).toBe('dark');
    expect(service.darkMode()).toBe(true);
    TestBed.tick();
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(THEME_SETTING_KEY)).toBe('system');
  });

  it('uses light for system without dark preference', () => {
    expect(create().activeTheme()).toBe('light');
  });

  it.each(['light', 'dark'] as const)('restores an explicit %s setting from storage', (setting) => {
    localStorage.setItem(THEME_SETTING_KEY, setting);
    mq.matches = setting === 'light';
    const service = create();
    expect(service.activeTheme()).toBe(setting);
  });

  it('falls back to the config setting and ignores invalid values', () => {
    configValues['theme.setting'] = 'dark';
    expect(create().activeTheme()).toBe('dark');
    TestBed.resetTestingModule();
    localStorage.setItem(THEME_SETTING_KEY, 'bogus');
    TestBed.configureTestingModule({
      providers: [
        { provide: MediaMatcher, useValue: { matchMedia: () => mq } },
        { provide: ConfigService, useValue: { get: (k: string, d?: unknown) => d } },
        { provide: PubSubService, useValue: pubSub },
      ],
    });
    expect(create().themeSetting()).toBe('system');
  });

  it('uses a custom storage key from the global namespace', () => {
    (window as any).__rxap__ = { ngx: { theme: { darkMode: { key: 'custom' } } } };
    localStorage.setItem('custom', 'dark');
    const service = create();
    TestBed.tick();
    expect(service.activeTheme()).toBe('dark');
  });

  it('reacts to system changes only in system mode', () => {
    const service = create();
    mq.emit(true);
    expect(service.activeTheme()).toBe('dark');
    service.setTheme('light', false);
    mq.emit(true);
    expect(service.activeTheme()).toBe('light');
  });

  it('toggleTheme flips setting and body classes', () => {
    const service = create();
    TestBed.tick();
    expect(document.body.classList.contains('light')).toBe(true);
    service.toggleTheme();
    TestBed.tick();
    expect(service.themeSetting()).toBe('dark');
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(document.body.classList.contains('light')).toBe(false);
    expect(localStorage.getItem(THEME_SETTING_KEY)).toBe('dark');
    service.toggleTheme();
    expect(service.activeTheme()).toBe('light');
  });

  it('setTheme publishes unless disabled', () => {
    const service = create();
    service.setTheme('dark');
    expect(pubSub.publish).toHaveBeenCalledWith(RXAP_TOPICS.theme.darkMode.changed, true);
    pubSub.publish.mockClear();
    service.setTheme('light', false);
    expect(pubSub.publish).not.toHaveBeenCalled();
  });

  it('restores dark mode from pubsub with debounce, ignoring undefined', () => {
    const service = create();
    restore$.next({ data: undefined });
    vi.advanceTimersByTime(1000);
    expect(service.themeSetting()).toBe('system');
    restore$.next({ data: true });
    expect(service.activeTheme()).toBe('light');
    vi.advanceTimersByTime(1000);
    expect(service.themeSetting()).toBe('dark');
    expect(service.activeTheme()).toBe('dark');
  });

  it('cleans up on destroy', () => {
    const service = create();
    expect(mq.listeners.size).toBe(1);
    TestBed.resetTestingModule();
    expect(mq.listeners.size).toBe(0);
    expect(restore$.observed).toBe(false);
    expect(service).toBeTruthy();
  });
});
