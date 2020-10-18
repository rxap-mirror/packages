import { Environment } from './environment.interface';

export const environment: Environment = {
  name:          'development',
  production:    false,
  master:        false,
  development:   true,
  stable:        false,
  staging:       false,
  local:         false,
  serviceWorker: false,
  e2e:           false,
  mergeRequest:  false
};
