import { InjectionToken } from '@angular/core';

export const RXAP_PUB_SUB_CACHE_SIZE = new InjectionToken<number>('rxap/pub-sub/max-cache-size', {
  providedIn: 'root',
  factory: () => 100,
});

export const RXAP_PUB_SUB_GARBAGE_COLLECTOR_INTERVAL = new InjectionToken<number>(
  'rxap/pub-sub/garbage-collector-interval', {
    providedIn: 'root',
    factory: () => 1000 * 60, // 1 minutes
  });

export const RXAP_PUB_SUB_DISABLE_CACHE = new InjectionToken<boolean>('rxap/pub-sub/disable-cache', {
  providedIn: 'root',
  factory: () => false,
});

export const RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR = new InjectionToken<boolean>(
  'rxap/pub-sub/disable-garbage-collector', {
    providedIn: 'root',
    factory: () => false,
  });
