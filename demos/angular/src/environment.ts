import { Environment } from '@rxap/environment';

export const environment: Environment = {
  production: false,
  serviceWorker: false,
  sentry: {
    enabled: false,
    debug: false,
  },
};
