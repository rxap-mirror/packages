import { HttpErrorResponse } from '@angular/common/http';
import {
  ErrorHandler,
  inject,
  Injectable,
  InjectionToken,
  INJECTOR,
  isDevMode,
  runInInjectionContext,
  StaticProvider,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import {
  IsNotReleaseVersion,
  RXAP_ENVIRONMENT,
} from '@rxap/environment';
import * as Sentry from '@sentry/angular-ivy';
import { AngularErrorDialogData } from './angular-error/angular-error-dialog-data';
import { AngularErrorService } from './angular-error/angular-error.service';
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
  sentry?: {
    showDialog?: boolean;
    dialogOptions?: Sentry.ReportDialogOptions;
  };
}

export const RXAP_ERROR_HANDLER_OPTIONS = new InjectionToken<ErrorHandlerOptions>('rxap-error-handler-options', {
  providedIn: 'root',
  factory: () => ({ logErrors: true }),
});

@Injectable()
export class RxapErrorHandler implements ErrorHandler {

  protected readonly options: ErrorHandlerOptions = (() => {
    const options = inject(RXAP_ERROR_HANDLER_OPTIONS);
    const environment = inject(RXAP_ENVIRONMENT);
    const config = inject(ConfigService);
    options.logErrors ??= true;
    options.sentry ??= {};
    options.sentry.showDialog ??= config.get('sentry.showDialog', false);
    // enforce sentry showDialog to false in dev mode
    options.sentry.showDialog = !isDevMode() && options.sentry.showDialog;
    options.showDialog ??= IsNotReleaseVersion(environment);
    options.sentry.dialogOptions ??= config.get('sentry.dialogOptions', {});
    options.sentry.dialogOptions.user ??= {};
    return options;
  })();

  protected readonly injector = inject(INJECTOR);

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

    if (this.options.sentry?.showDialog) {
      if (!(error instanceof HttpErrorResponse)) {
        Sentry.showReportDialog({
          ...(this.options.sentry.dialogOptions ?? {}),
          eventId,
        });
      }
    } else if (this.options.showDialog) {
      const nonMessage = 'unsupported error type for angular error dialog';
      const data: AngularErrorDialogData = {
        message: nonMessage,
        contexts,
        extra,
        tags,
      };
      if (typeof extractedError === 'string') {
        data.message = extractedError;
      } else if (!(extractedError instanceof HttpErrorResponse)) {
        data.message = extractedError.message;
        data.stack = extractedError.stack;
        data.name = extractedError.name;
      }

      if (data.message !== nonMessage) {
        this.showAngularErrorDialog(data);
      }

    }

  }

  protected showAngularErrorDialog(data: AngularErrorDialogData): void {
    runInInjectionContext(this.injector, () => {
      console.log('showAngularErrorDialog', data);
      inject(AngularErrorService).push(data);
    });
  }


}

export function ProvideErrorHandler(): StaticProvider {
  return {
    provide: ErrorHandler,
    useClass: RxapErrorHandler,
  };
}
