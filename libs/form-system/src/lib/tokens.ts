import { InjectionToken } from '@angular/core';
import { BaseControlComponent } from './form-controls/base-control.component';

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

export const RXAP_CONTROL_COMPONENT = new InjectionToken<BaseControlComponent<any, any>>('rxap/form-system/form-controls/CONTROL_COMPONENT');
