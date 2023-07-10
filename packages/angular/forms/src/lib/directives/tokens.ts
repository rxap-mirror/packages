import { InjectionToken } from '@angular/core';
import { FormDefinition } from '../model';
import { RxapFormBuilder } from '../form-builder';
import {
  FormLoadMethod,
  FormSubmitMethod,
} from './models';

export const RXAP_FORM_DEFINITION = new InjectionToken<FormDefinition>('rxap/forms/definition');

export const RXAP_FORM_DEFINITION_BUILDER = new InjectionToken<RxapFormBuilder>('rxap/forms/definition-builder');

export const RXAP_FORM_SUBMIT_METHOD = new InjectionToken<FormSubmitMethod<any>>('rxap/form/submit-method');

export const RXAP_FORM_SUBMIT_FAILED_METHOD = new InjectionToken<FormSubmitMethod<any>>('rxap/form/submit-failed-method');

export const RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD = new InjectionToken<FormSubmitMethod<any>>(
  'rxap/form/submit-successful-method');

export const RXAP_FORM_LOAD_METHOD = new InjectionToken<FormLoadMethod>('rxap/form/load-method');

export const RXAP_FORM_LOAD_FAILED_METHOD = new InjectionToken<FormLoadMethod>('rxap/form/load-failed-method');

export const RXAP_FORM_LOAD_SUCCESSFUL_METHOD = new InjectionToken<FormLoadMethod>('rxap/form/load-successful-method');
