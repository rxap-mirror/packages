import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideAutoErrorInterception,
  ProvideErrorHandler,
  withErrorCaptureDialogDisabledIf,
  withErrorCaptureDialogService,
} from './provide';
import { RxapErrorHandler } from './error-handler';
import {
  RXAP_ERROR_CAPTURE_DIALOG_SERVICE,
  RXAP_ERROR_DIALOG_DISABLED,
} from './tokens';

describe('provide', () => {
  it('provideAutoErrorInterception registers the handler and extra providers', () => {
    const extra = { provide: 'X', useValue: 1 };
    const result = provideAutoErrorInterception(extra);
    expect(result).toEqual([
      { provide: ErrorHandler, useClass: RxapErrorHandler },
      extra,
    ]);
  });

  it('ProvideErrorHandler registers the handler', () => {
    expect(ProvideErrorHandler()).toEqual([
      { provide: ErrorHandler, useClass: RxapErrorHandler },
    ]);
  });

  it('withErrorCaptureDialogService provides the service', () => {
    class S {
      open() {
        return null as any;
      }
    }
    expect(withErrorCaptureDialogService(S)).toEqual({
      provide: RXAP_ERROR_CAPTURE_DIALOG_SERVICE,
      useClass: S,
    });
  });

  it('withErrorCaptureDialogDisabledIf accepts booleans and functions', () => {
    expect(withErrorCaptureDialogDisabledIf(true)).toEqual({
      provide: RXAP_ERROR_DIALOG_DISABLED,
      useValue: true,
    });
    expect(withErrorCaptureDialogDisabledIf(() => false)).toEqual({
      provide: RXAP_ERROR_DIALOG_DISABLED,
      useValue: false,
    });
  });

  it('RXAP_ERROR_DIALOG_DISABLED defaults to false', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(RXAP_ERROR_DIALOG_DISABLED)).toBe(false);
  });
});
