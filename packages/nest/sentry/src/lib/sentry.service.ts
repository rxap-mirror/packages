import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  Client,
  ClientOptions,
} from '@sentry/types';
import * as Sentry from '@sentry/node';
import { SENTRY_MODULE_OPTIONS } from './tokens';
import { SentryModuleOptions } from './sentry.interfaces';

@Injectable()
export class SentryService implements OnApplicationShutdown, OnApplicationBootstrap {

  @Inject(SENTRY_MODULE_OPTIONS)
  private readonly options!: SentryModuleOptions;

  get hasInstance(): boolean {
    return !!this.options.dsn;
  }

  onApplicationBootstrap(): any {
    if (!this.options.dsn) {
      console.warn('Could not create SentryService instance. The required option dsn is not defined');
      return;
    }
    const {
      integrations = [],
      ...sentryOptions
    } = this.options;
    Sentry.init({
      ...sentryOptions,
      integrations: [
        new Sentry.Integrations.OnUncaughtException({
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
        new Sentry.Integrations.OnUnhandledRejection({ mode: 'warn' }),
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
