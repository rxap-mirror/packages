import {
  APP_INITIALIZER,
  Provider,
} from '@angular/core';
import { UserSettingsThemeService } from './user-settings-theme.service';

export function provideUserTheme(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: (userSettingsThemeService: UserSettingsThemeService) => userSettingsThemeService.restore(),
      deps: [ UserSettingsThemeService ],
      multi: true
    }
  ];
}
