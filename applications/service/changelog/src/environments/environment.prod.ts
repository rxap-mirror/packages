import { Environment } from '@rxap/nest-utilities';

export const environment: Environment = {
  name: 'production',
  production: true,
  app: 'service-changelog',
  sentry: {
    enabled: true,
    debug: false,
  },
};
