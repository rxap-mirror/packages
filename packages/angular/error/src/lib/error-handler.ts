import { HttpErrorResponse } from '@angular/common/http';
import {
  ErrorHandler,
  inject,
  Injectable,
  InjectionToken,
  isDevMode,
  StaticProvider,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import * as Sentry from '@sentry/angular-ivy';
import {
  ExtractContextFromError,
  ExtractError,
  ExtractExtraFromError,
  ExtractTagsFromError,
  PrintError,
} from './utilities';

export interface ErrorHandlerOptions {
  logErrors?: boolean;
  showDialog?: boolean;
  dialogOptions?: Sentry.ReportDialogOptions;
}

export const RXAP_ERROR_HANDLER_OPTIONS = new InjectionToken<ErrorHandlerOptions>('rxap-error-handler-options', {
  providedIn: 'root',
  factory: () => ({ logErrors: true }),
});

@Injectable()
export class RxapErrorHandler implements ErrorHandler {

  protected readonly options: ErrorHandlerOptions = (() => {
    const options = inject(RXAP_ERROR_HANDLER_OPTIONS);
    const config = inject(ConfigService);
    options.logErrors ??= true;
    options.showDialog ??= config.get('sentry.showDialog', false);
    // enforce showDialog to false in dev mode
    options.showDialog = !isDevMode() && options.showDialog;
    options.dialogOptions ??= config.get('sentry.dialogOptions', {});
    options.dialogOptions.user ??= {};
    return options;
  })();

  /**
   * Method called for every value captured through the ErrorHandler
   */
  public handleError(errorCandidate: unknown): void {

    let error = errorCandidate;

    // Try to unwrap zone.js error.
    // https://github.com/angular/angular/blob/master/packages/core/src/util/errors.ts
    if (error && (error as { ngOriginalError: Error }).ngOriginalError) {
      error = (error as { ngOriginalError: Error }).ngOriginalError;
    }

    const extractedError = ExtractError(error);

    const contexts = ExtractContextFromError(error);
    const extra = ExtractExtraFromError(error);
    const tags = ExtractTagsFromError(error);

    let eventId: string;

    // Capture handled exception and send it to Sentry.
    if (typeof extractedError === 'string') {
      eventId = Sentry.captureMessage(extractedError, {
        level: 'error',
        contexts,
        extra,
        tags,
      });
    } else {
      eventId = Sentry.captureException(extractedError, {
        level: 'error',
        contexts,
        extra,
        tags,
      });
    }

    if (this.options.logErrors) {
      PrintError(error);
    }

    if (this.options.showDialog) {
      if (!(error instanceof HttpErrorResponse)) {
        Sentry.showReportDialog({
          ...(this.options.dialogOptions ?? {}),
          eventId,
        });
      }
    }

  }


}

export function ProvideErrorHandler(): StaticProvider {
  return {
    provide: ErrorHandler,
    useClass: RxapErrorHandler,
  };
}
