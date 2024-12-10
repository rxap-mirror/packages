import {
  EnvironmentProviders,
  inject,
  provideAppInitializer,
  Provider,
} from '@angular/core';
import { PubSubService } from './pub-sub.service';
import {
  RXAP_PUB_SUB_DISABLE_CACHE,
  RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR,
} from './tokens';

export function ProvidePubSub(...providers: Provider[]): Array<Provider | EnvironmentProviders> {
  return [
    provideAppInitializer(() => {
        const initializerFn = ((service: PubSubService) => () => service.startGarbageCollector())(inject(PubSubService));
        return initializerFn();
      }),
    ...providers,
  ];
}

export function withDisableCache(): Provider {
  return {
    provide: RXAP_PUB_SUB_DISABLE_CACHE,
    useValue: true,
  };
}

export function withDisableGarbageCollector(): Provider {
  return {
    provide: RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR,
    useValue: true,
  };
}

export function withMaxCacheSize(size: number): Provider {
  return {
    provide: RXAP_PUB_SUB_DISABLE_CACHE,
    useValue: size,
  };
}

export function withGarbageCollectorInterval(interval: number): Provider {
  return {
    provide: RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR,
    useValue: interval,
  };
}
