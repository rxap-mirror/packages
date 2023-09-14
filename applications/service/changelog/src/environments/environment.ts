import { Environment } from '@rxap/nest-utilities';

export const environment: Environment = {
  name: 'development',
  production: false,
  app: 'service-changelog',
  sentry: {
    enabled: false,
    debug: false,
  },
};
