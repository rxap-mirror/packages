import { TestBed } from '@angular/core/testing';
import { PubSubService, RXAP_TOPICS } from '@rxap/ngx-pub-sub';
import { DarkModeControllerDisableRemoteMethod } from './openapi/remote-methods/dark-mode-controller-disable.remote-method';
import { DarkModeControllerEnableRemoteMethod } from './openapi/remote-methods/dark-mode-controller-enable.remote-method';
import { DarkModeControllerGetRemoteMethod } from './openapi/remote-methods/dark-mode-controller-get.remote-method';
import { DarkModeControllerToggleRemoteMethod } from './openapi/remote-methods/dark-mode-controller-toggle.remote-method';
import { LanguageControllerGetRemoteMethod } from './openapi/remote-methods/language-controller-get.remote-method';
import { LanguageControllerSetRemoteMethod } from './openapi/remote-methods/language-controller-set.remote-method';
import { SettingsControllerGetRemoteMethod } from './openapi/remote-methods/settings-controller-get.remote-method';
import { SettingsControllerSetRemoteMethod } from './openapi/remote-methods/settings-controller-set.remote-method';
import { ThemeControllerGetRemoteMethod } from './openapi/remote-methods/theme-controller-get.remote-method';
import { ThemeControllerSetDensityRemoteMethod } from './openapi/remote-methods/theme-controller-set-density.remote-method';
import { ThemeControllerSetPresetRemoteMethod } from './openapi/remote-methods/theme-controller-set-preset.remote-method';
import { ThemeControllerSetTypographyRemoteMethod } from './openapi/remote-methods/theme-controller-set-typography.remote-method';
import { ThemeControllerSetRemoteMethod } from './openapi/remote-methods/theme-controller-set.remote-method';
import { UserSettingsDarkModeDataSource } from './user-settings-dark-mode.data-source';
import { UserSettingsDarkModeService } from './user-settings-dark-mode.service';
import { UserSettingsLanguageDataSource } from './user-settings-language.data-source';
import { UserSettingsLanguageService } from './user-settings-language.service';
import { UserSettingsThemeDataSource } from './user-settings-theme.data-source';
import { UserSettingsThemeService } from './user-settings-theme.service';
import { UserSettingsDataSource } from './user-settings.data-source';
import { UserSettingsService } from './user-settings.service';

const method = (result: any = undefined) => ({ call: jest.fn().mockResolvedValue(result) });
const ds = () => ({ refresh: jest.fn() });

describe('UserSettingsDarkModeService', () => {
  const get = method(true), toggle = method(), disable = method(), enable = method(), source = ds();
  let service: UserSettingsDarkModeService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DarkModeControllerGetRemoteMethod, useValue: get },
        { provide: DarkModeControllerToggleRemoteMethod, useValue: toggle },
        { provide: DarkModeControllerDisableRemoteMethod, useValue: disable },
        { provide: DarkModeControllerEnableRemoteMethod, useValue: enable },
        { provide: UserSettingsDarkModeDataSource, useValue: source },
      ],
    });
    source.refresh.mockClear();
    service = TestBed.inject(UserSettingsDarkModeService);
  });

  it('gets the value', async () => expect(await service.getDarkMode()).toBe(true));

  it.each([
    ['toggleDarkMode', toggle],
    ['disableDarkMode', disable],
    ['enableDarkMode', enable],
  ] as const)('%s calls the method and refreshes', async (name, m) => {
    await (service as any)[name]();
    expect(m.call).toHaveBeenCalled();
    expect(source.refresh).toHaveBeenCalledTimes(1);
  });
});

describe('UserSettingsLanguageService', () => {
  const get = method('de'), set = method(), source = ds();
  let service: UserSettingsLanguageService;
  beforeEach(() => {
    set.call.mockClear();
    source.refresh.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: LanguageControllerGetRemoteMethod, useValue: get },
        { provide: LanguageControllerSetRemoteMethod, useValue: set },
        { provide: UserSettingsLanguageDataSource, useValue: source },
      ],
    });
    service = TestBed.inject(UserSettingsLanguageService);
  });

  it('gets the language', async () => expect(await service.getLanguage()).toBe('de'));

  it('sets the language, runs hooks and refreshes', async () => {
    const hook = jest.fn();
    service.registerSetLanguageHook(hook);
    await service.setLanguage('en');
    expect(hook).toHaveBeenCalledWith('en', false);
    expect(set.call).toHaveBeenCalledWith({ parameters: { language: 'en' } });
    expect(source.refresh).toHaveBeenCalled();
  });

  it('unregisters and clears hooks', async () => {
    const a = jest.fn(), b = jest.fn();
    service.registerSetLanguageHook(a);
    service.registerSetLanguageHook(b);
    service.unregisterSetLanguageHook(a);
    await service.setLanguage('en');
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
    service.clearSetLanguageHook();
    await service.setLanguage('en');
    expect(b).toHaveBeenCalledTimes(1);
  });
});

describe('UserSettingsService', () => {
  it('sets and gets', async () => {
    const get = method({ darkMode: true }), set = method(), source = ds();
    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsControllerGetRemoteMethod, useValue: get },
        { provide: SettingsControllerSetRemoteMethod, useValue: set },
        { provide: UserSettingsDataSource, useValue: source },
      ],
    });
    const service = TestBed.inject(UserSettingsService);
    expect(await service.get()).toEqual({ darkMode: true });
    await service.set({ darkMode: false } as any);
    expect(set.call).toHaveBeenCalledWith({ requestBody: { darkMode: false } });
    expect(source.refresh).toHaveBeenCalled();
  });
});

describe('UserSettingsThemeService', () => {
  const get = method({ preset: 'p', density: -1, typography: 't' });
  const set = method(), density = method(), preset = method(), typography = method();
  const source = ds();
  let service: UserSettingsThemeService;
  let pubSub: PubSubService;

  beforeEach(() => {
    jest.useFakeTimers();
    for (const m of [set, density, preset, typography]) m.call.mockClear();
    source.refresh.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: ThemeControllerGetRemoteMethod, useValue: get },
        { provide: ThemeControllerSetRemoteMethod, useValue: set },
        { provide: ThemeControllerSetDensityRemoteMethod, useValue: density },
        { provide: ThemeControllerSetPresetRemoteMethod, useValue: preset },
        { provide: ThemeControllerSetTypographyRemoteMethod, useValue: typography },
        { provide: UserSettingsThemeDataSource, useValue: source },
      ],
    });
    service = TestBed.inject(UserSettingsThemeService);
    pubSub = TestBed.inject(PubSubService);
  });

  afterEach(() => jest.useRealTimers());

  it('get returns the theme', async () => {
    expect(await service.get()).toEqual({ preset: 'p', density: -1, typography: 't' });
  });

  it('set variants call their methods and refresh', async () => {
    await service.set({ preset: 'x' } as any);
    expect(set.call).toHaveBeenCalledWith({ requestBody: { preset: 'x' } });
    await service.setDensity(-2 as any);
    expect(density.call).toHaveBeenCalledWith({ requestBody: { value: -2 } });
    await service.setPreset('pp');
    expect(preset.call).toHaveBeenCalledWith({ requestBody: { value: 'pp' } });
    await service.setTypography('tt');
    expect(typography.call).toHaveBeenCalledWith({ requestBody: { value: 'tt' } });
    expect(source.refresh).toHaveBeenCalledTimes(4);
  });

  it('syncs published changes debounced', async () => {
    await service.get();
    pubSub.publish(RXAP_TOPICS.theme.density.changed, -1);
    pubSub.publish(RXAP_TOPICS.theme.preset.changed, 'abc');
    pubSub.publish(RXAP_TOPICS.theme.typography.changed, 'def');
    expect(density.call).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1000);
    expect(density.call).toHaveBeenCalledWith({ requestBody: { value: -1 } });
    expect(preset.call).toHaveBeenCalledWith({ requestBody: { value: 'abc' } });
    expect(typography.call).toHaveBeenCalledWith({ requestBody: { value: 'def' } });
  });

  it('ignores invalid payloads and subscribes only once', async () => {
    await service.get();
    await service.get();
    pubSub.publish(RXAP_TOPICS.theme.density.changed, 'nope');
    pubSub.publish(RXAP_TOPICS.theme.preset.changed, 5);
    pubSub.publish(RXAP_TOPICS.theme.typography.changed, 5);
    await jest.advanceTimersByTimeAsync(1000);
    expect(density.call).not.toHaveBeenCalled();
    expect(preset.call).not.toHaveBeenCalled();
    expect(typography.call).not.toHaveBeenCalled();
  });

  it('restore publishes the stored theme', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const spy = jest.spyOn(pubSub, 'publish');
    await service.restore();
    expect(spy).toHaveBeenCalledWith(RXAP_TOPICS.theme.preset.restore, 'p');
    expect(spy).toHaveBeenCalledWith(RXAP_TOPICS.theme.density.restore, -1);
    expect(spy).toHaveBeenCalledWith(RXAP_TOPICS.theme.typography.restore, 't');
  });

  it('unsubscribes on destroy', async () => {
    await service.get();
    TestBed.resetTestingModule();
    expect((service as any).syncSubscription.closed).toBe(true);
  });
});
