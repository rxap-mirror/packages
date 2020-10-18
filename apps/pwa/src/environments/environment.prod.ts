import { Environment } from './environment.interface';

export const environment: Environment = {
  name:          'production',
  production:    true,
  master:        false,
  development:   false,
  stable:        false,
  staging:       false,
  local:         false,
  serviceWorker: true,
  e2e:           false,
  mergeRequest:  false
};
