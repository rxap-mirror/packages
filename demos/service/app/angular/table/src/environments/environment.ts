import { Environment } from '@rxap/nest-utilities';

export const environment: Environment = {
  name: 'development',
  production: false,
  sentry: {
    enabled: false,
    debug: false,
  },
};
