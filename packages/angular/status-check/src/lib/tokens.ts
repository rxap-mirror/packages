import {
  InjectionToken,
  isDevMode,
} from '@angular/core';

export const STATUS_INDICATOR_INTERVAL = new InjectionToken('status-indicator-interval', {
  providedIn: 'root',
  factory: () => isDevMode() ? 60 : 60 * 5,
});


export const STATUS_CHECK_INTERVAL = new InjectionToken('status-check-interval', {
  providedIn: 'root',
  factory: () => isDevMode() ? 5 : 60,
});
