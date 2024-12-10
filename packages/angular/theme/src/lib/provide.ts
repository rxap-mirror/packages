import {
  inject,
  provideAppInitializer,
} from '@angular/core';
import { ThemeService } from './theme.service';

export function provideTheme() {
  return [
    provideAppInitializer(() => {
        const initializerFn = ((themeService: ThemeService) => () => themeService.restore())(inject(ThemeService));
        return initializerFn();
      })
  ];
}
