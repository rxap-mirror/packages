import { Provider, inject, provideAppInitializer } from '@angular/core';
import { UserSettingsThemeService } from './user-settings-theme.service';

export function provideUserTheme() {
  return [
    provideAppInitializer(() => {
        const initializerFn = ((userSettingsThemeService: UserSettingsThemeService) => () => userSettingsThemeService.restore())(inject(UserSettingsThemeService));
        return initializerFn();
      })
  ];
}
