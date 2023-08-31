import { Environment } from '@rxap/environment';

export const environment: Environment = {
  name: 'production',
  production: true,
  app: 'angular',
  serviceWorker: true,
  sentry: {
    enabled: true,
    debug: false,
  },
};
