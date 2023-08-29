import { Environment } from '@rxap/nest-utilities';

export const environment: Environment = {
  name: 'development',
  production: false,
  app: 'service-app-angular-table',
  sentry: {
    enabled: false,
    debug: false,
  },
};
