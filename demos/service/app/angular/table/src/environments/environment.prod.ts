import { Environment } from '@rxap/nest-utilities';

export const environment: Environment = {
  name: 'production',
  production: true,
  app: 'service-app-angular-table',
  sentry: {
    enabled: true,
    debug: false,
  },
};
