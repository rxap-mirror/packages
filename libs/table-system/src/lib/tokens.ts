import { InjectionToken } from '@angular/core';

export const ROOT_TABLE_DEFINITION_TOKEN = new InjectionToken('rxap/table-system/ROOT_TABLE_DEFINITION_TOKEN', {
  providedIn: 'root',
  factory:    () => []
});

export const REGISTER_TABLE_DEFINITION_TOKEN = new InjectionToken('rxap/table-system/REGISTER_TABLE_DEFINITION_TOKEN', {
  providedIn: 'root',
  factory:    () => []
});
