import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  Client,
  ClientOptions,
} from '@sentry/types';
import { SentryModuleOptions } from './sentry.interfaces';
import { SENTRY_MODULE_OPTIONS } from './tokens';
import * as Sentry from "@sentry/nestjs"
import { nodeProfilingIntegration } from "@sentry/profiling-node";

@Injectable()
export class SentryService implements OnApplicationShutdown, OnApplicationBootstrap {

  @Inject(SENTRY_MODULE_OPTIONS)
  private readonly options!: SentryModuleOptions;

  @Inject(Logger)
  private readonly logger!: Logger;

  get hasInstance(): boolean {
    return !!this.options.dsn;
  }

  onApplicationBootstrap(): any {
    if (!this.options.dsn) {
      if (this.options.enabled !== false) {
        this.logger.warn(
          'Could not create SentryService instance. The required option dsn is not defined', 'SentryService');
      } else {
        this.logger.verbose('Dsn is not defined, but sentry is disabled', 'SentryService');
      }
      return;
    }
    const {
      integrations = [],
      ...sentryOptions
    } = this.options;
    Sentry.init({
      ...sentryOptions,
      integrations: [
        nodeProfilingIntegration(),
        Sentry.onUncaughtExceptionIntegration({
          onFatalError: async (err) => {
            // console.error('uncaughtException, not cool!')
            // console.error(err);
            if (err.name === 'SentryError') {
              console.log(err);
            } else {
              (
                Sentry.getCurrentHub().getClient<
                  Client<ClientOptions>
                >() as Client<ClientOptions>
              ).captureException(err);
              process.exit(1);
            }
          },
        }),
        Sentry.onUnhandledRejectionIntegration({ mode: 'warn' }),
        ...integrations,
      ],
    });
  }

  instance() {
    return Sentry;
  }

  async onApplicationShutdown(signal?: string) {
    if (this.hasInstance && this.options.close?.enabled === true) {
      await Sentry.close(this.options.close.timeout);
    }
  }

}
