import {
  EnvironmentProviders,
  ErrorHandler,
  Provider,
} from '@angular/core';
import {
  RXAP_ERROR_CAPTURE_DIALOG_SERVICE,
  RXAP_ERROR_DIALOG_DISABLED,
} from './tokens';
import { Constructor } from '@rxap/utilities';
import { IErrorCaptureDialogService } from './error-capture-dialog.service';
import { RxapErrorHandler } from './error-handler';

export function provideAutoErrorInterception(...providers: Array<Provider | EnvironmentProviders>) {
  return [
    {
      provide: ErrorHandler,
      useClass: RxapErrorHandler,
    },
    ...providers,
  ];
}

export function withErrorCaptureDialogService(service: Constructor<IErrorCaptureDialogService>): Provider {
  return {
    provide: RXAP_ERROR_CAPTURE_DIALOG_SERVICE,
    useClass: service,
  };
}

export function withErrorCaptureDialogDisabledIf(condition: boolean | (() => boolean)): Provider {
  return {
    provide: RXAP_ERROR_DIALOG_DISABLED,
    useValue: typeof condition === 'function' ? condition() : condition,
  };
}

/**
 * @deprecated Use `provideAutoErrorInterception` instead.
 */
export function ProvideErrorHandler(): Array<Provider | EnvironmentProviders> {
  return [
    {
      provide: ErrorHandler,
      useClass: RxapErrorHandler,
    }
  ];
}
