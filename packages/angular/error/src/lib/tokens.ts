import { ComponentType } from '@angular/cdk/overlay';
import {
  InjectionToken,
  Signal,
} from '@angular/core';
import { IErrorDialogComponent } from './error-dialog/error-dialog.component';
import { ErrorInterceptorOptions } from './error-interceptor-options';

export const RXAP_ERROR_DIALOG_DATA = new InjectionToken<Signal<any[]>>('rxap/error/dialog-data');

export const RXAP_ERROR_DIALOG_ERROR = new InjectionToken<any>('rxap/error/dialog-error');

export const RXAP_ERROR_DIALOG_COMPONENT = new InjectionToken<ComponentType<IErrorDialogComponent>>(
  'rxap/error/dialog-component');

export const RXAP_ERROR_INTERCEPTOR_OPTIONS = new InjectionToken<ErrorInterceptorOptions>(
  'rxap/error/interceptor-options');
