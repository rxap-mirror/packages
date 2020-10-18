import { InjectionToken } from '@angular/core';
import { FullstoryConfig } from './fullstory.config';

export const RXAP_FULLSTORY_CONFIG = new InjectionToken<FullstoryConfig>('rxap/fullstory/config');
export const RXAP_FULLSTORY_ACTIVE = new InjectionToken<boolean>('rxap/fullstory/deactivate');
