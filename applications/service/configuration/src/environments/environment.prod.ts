import { Environment } from '@rxap/nest-utilities';

export const environment: Environment = {
  name: 'production',
  production: true,

  sentry: {
    enabled: true,
    debug: false,
  },
};
