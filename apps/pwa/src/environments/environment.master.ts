import { Environment } from './environment.interface';

export const environment: Environment = {
  name:          'master',
  production:    false,
  master:        true,
  development:   true,
  stable:        false,
  staging:       false,
  local:         false,
  serviceWorker: true,
  e2e:           false,
  mergeRequest:  false
};
