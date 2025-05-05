import {
  EnvironmentProviders,
  ErrorHandler,
  Provider,
} from '@angular/core';
import {
  RXAP_ERROR_CAPTURE_DIALOG_SERVICE,
  RxapErrorHandler,
} from '@rxap/ngx-error';
import { Constructor } from '@rxap/utilities';
import { IErrorCaptureDialogService } from './error-capture-dialog.service';

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
