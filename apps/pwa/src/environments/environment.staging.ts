import { Environment } from './environment.interface';

export const environment: Environment = {
  name:          'staging',
  production:    true,
  master:        false,
  development:   false,
  stable:        false,
  staging:       true,
  local:         false,
  serviceWorker: true,
  e2e:           false,
  mergeRequest:  false
};
