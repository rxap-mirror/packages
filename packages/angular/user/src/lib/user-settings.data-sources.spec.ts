import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ProfileControllerGetRemoteMethod } from './openapi/remote-methods/profile-controller-get.remote-method';
import { SettingsControllerGetRemoteMethod } from './openapi/remote-methods/settings-controller-get.remote-method';
import { UserProfileDataSource } from './user-profile.data-source';
import { UserSettingsDarkModeDataSource } from './user-settings-dark-mode.data-source';
import { UserSettingsLanguageDataSource } from './user-settings-language.data-source';
import { UserSettingsThemeDataSource } from './user-settings-theme.data-source';
import { UserSettingsDataSource } from './user-settings.data-source';
import { provideUserTheme } from './provide';
import { UserSettingsThemeService } from './user-settings-theme.service';

describe('user data sources', () => {
  const settings = { darkMode: true, language: 'de', theme: { preset: 'x' } };
  const getSettings = { call: jest.fn() };
  const getProfile = { call: jest.fn() };

  beforeEach(() => {
    getSettings.call.mockReset().mockResolvedValue(settings);
    getProfile.call.mockReset().mockResolvedValue({ name: 'me' });
    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsControllerGetRemoteMethod, useValue: getSettings },
        { provide: ProfileControllerGetRemoteMethod, useValue: getProfile },
      ],
    });
  });

  it('loads settings via the remote method', async () => {
    const source = TestBed.inject(UserSettingsDataSource);
    expect(await firstValueFrom(source.connect({ id: 'test' } as any) as any)).toBeTruthy();
    expect(getSettings.call).toHaveBeenCalled();
  });

  it('loads the profile via the remote method', async () => {
    const source = TestBed.inject(UserProfileDataSource);
    expect(source).toBeInstanceOf(UserProfileDataSource);
    await source.refresh();
    expect(getProfile.call).toHaveBeenCalled();
  });

  it('derives dark mode, language and theme from settings', async () => {
    const dark = TestBed.inject(UserSettingsDarkModeDataSource);
    const lang = TestBed.inject(UserSettingsLanguageDataSource);
    const theme = TestBed.inject(UserSettingsThemeDataSource);
    expect(await firstValueFrom(dark.connect({ id: 'test' } as any) as any)).toBe(true);
    expect(await firstValueFrom(lang.connect({ id: 'test' } as any) as any)).toBe('de');
    expect(await firstValueFrom(theme.connect({ id: 'test' } as any) as any)).toEqual({ preset: 'x' });
  });

  it('provideUserTheme restores the theme on init', () => {
    const restore = jest.fn().mockResolvedValue(undefined);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideUserTheme(), { provide: UserSettingsThemeService, useValue: { restore } }],
    });
    TestBed.inject(UserSettingsThemeService);
    expect(restore).toHaveBeenCalled();
  });
});
