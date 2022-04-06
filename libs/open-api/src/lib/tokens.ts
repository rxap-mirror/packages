import { InjectionToken } from '@angular/core';

export const RXAP_OPEN_API_CONFIG                     = new InjectionToken('rxap/open-api/config');
export const RXAP_OPEN_API_STRICT_VALIDATOR           = new InjectionToken('rxap/open-api/strict-validator');
export const DEFAULT_OPEN_API_REMOTE_METHOD_META_DATA = new InjectionToken('rxap/open-api/default-remote-method-meta-data');
export const DEFAULT_OPEN_API_DATA_SOURCE_META_DATA   = new InjectionToken('rxap/open-api/default-data-source-meta-data');
export const DISABLE_SCHEMA_VALIDATION                = new InjectionToken<boolean>('rxap/open-api/disable-shema-validation');
