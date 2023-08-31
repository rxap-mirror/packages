import { Environment } from '@rxap/environment';

export const environment: Environment = {
  name: 'development',
  production: false,
  app: 'angular',
  serviceWorker: false,
  sentry: {
    enabled: false,
    debug: false,
  },
};
