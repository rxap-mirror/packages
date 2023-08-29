import { Environment } from '@rxap/nest-utilities';

export const environment: Environment = {
  name: 'production',
  production: true,
  app: 'service-status',
  sentry: {
    enabled: true,
    debug: false,
  },
};
