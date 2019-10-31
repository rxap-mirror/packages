import { InjectionToken } from '@angular/core';

export const ROOT_FORM_DEFINITION_TOKEN = new InjectionToken('rxap/form-system/ROOT_FORM_DEFINITION_TOKEN',{
  providedIn: 'root',
  factory: () => []
});

export const REGISTER_FORM_DEFINITION_TOKEN = new InjectionToken('rxap/form-system/REGISTER_FORM_DEFINITION_TOKEN',{
  providedIn: 'root',
  factory: () => []
});

export const RXAP_FORM_ID = new InjectionToken<string>('rxap/form-system/FORM_ID');

export const RXAP_FORM_INSTANCE_ID = new InjectionToken<boolean>('rxap/form-system/FORM_INSTANCE_ID');
