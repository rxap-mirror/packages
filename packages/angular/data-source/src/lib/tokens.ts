import { InjectionToken } from '@angular/core';
import { Method } from '@rxap/pattern';

export const RXAP_STATIC_DATA_SOURCE_DATA = new InjectionToken('rxap/data-source/static-data-source-data');

export const RXAP_DATA_SOURCE_REFRESH = new InjectionToken('rxap/data-source/refresh');

export const RXAP_OBSERVABLE_DATA_SOURCE = new InjectionToken('rxap/data-source/observable-data-source');

export const RXAP_DATA_SOURCE_METADATA = new InjectionToken('rxap/data-source/metadata');

export const RXAP_DATA_SOURCE = new InjectionToken('rxap/data-source/instance');

export const RXAP_PIPE_DATA_SOURCE_OPERATOR = new InjectionToken('rxap/data-source/pipe-operator');

export const RXAP_DATA_SOURCE_METHOD = new InjectionToken<Method>('rxap/data-source/method');

export const RXAP_DATA_SOURCE_METHOD_WITHOUT_PARAMETERS = new InjectionToken<boolean>(
  'rxap/data-source/method-without-parameters',
  {
    providedIn: 'root',
    factory: () => false,
  },
);
