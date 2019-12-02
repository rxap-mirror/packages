import { InjectionToken } from '@angular/core';

export const ROOT_DATA_SOURCE_TOKEN = new InjectionToken('rxap/data-source/ROOT_DATA_SOURCE_TOKEN', {
  providedIn: 'root',
  factory:    () => []
});

export const REGISTER_DATA_SOURCE_TOKEN = new InjectionToken('rxap/data-source/REGISTER_DATA_SOURCE_TOKEN', {
  providedIn: 'root',
  factory:    () => []
});
