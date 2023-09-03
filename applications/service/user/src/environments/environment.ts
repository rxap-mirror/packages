import { Environment } from '@rxap/nest-utilities';

export const environment: Environment = {
  name: 'development',
  production: false,
  app: 'service-user',
  sentry: {
    enabled: false,
    debug: false,
  },
};
