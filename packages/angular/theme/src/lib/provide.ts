import {
  APP_INITIALIZER,
  Provider,
} from '@angular/core';
import { ThemeService } from './theme.service';

export function provideTheme(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: (themeService: ThemeService) => () => themeService.restore(),
      deps: [ ThemeService ],
      multi: true
    }
  ];
}
