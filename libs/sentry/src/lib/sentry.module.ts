import {
  NgModule,
  ModuleWithProviders,
  ErrorHandler
} from '@angular/core';
import {
  RXAP_SENTRY_CONFIG,
  RXAP_SENTRY_LOG_ERROR
} from './tokens';
import { BrowserOptions } from '@sentry/browser';
import { SentryService } from './sentry.service';
import { SentryErrorHandler } from './sentry.error-handler';


@NgModule()
export class SentryModule {

  public static forRoot(options: BrowserOptions, logError: boolean = false): ModuleWithProviders<SentryModule> {
    return {
      ngModule: SentryModule,
      providers: [
        {
          provide: RXAP_SENTRY_CONFIG,
          useValue: options,
        },
        {
          provide: RXAP_SENTRY_LOG_ERROR,
          useValue: logError
        },
        {
          provide:  ErrorHandler,
          useClass: SentryErrorHandler
        },
      ]
    };
  }

  constructor(private readonly sentryService: SentryService) {
    this.sentryService.init();
  }

}
