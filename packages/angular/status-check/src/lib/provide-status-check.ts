import { Provider } from '@angular/core';
import {
  STATUS_CHECK_INTERVAL,
  STATUS_INDICATOR_INTERVAL,
} from './tokens';

export function ProvideStatusCheck(...withProvider: Array<Provider | Provider[]>): Provider[] {
  return withProvider.flat();
}

export function withStatusCheckInterval(interval: number): Provider {
  return {
    provide: STATUS_CHECK_INTERVAL,
    useValue: interval,
  };
}

export function withStatusIndicatorInterval(interval: number): Provider {
  return {
    provide: STATUS_INDICATOR_INTERVAL,
    useValue: interval,
  };
}
