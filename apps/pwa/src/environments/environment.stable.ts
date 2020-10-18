import { Environment } from './environment.interface';

export const environment: Environment = {
  name:          'stable',
  production:    false,
  master:        false,
  development:   true,
  stable:        true,
  staging:       false,
  local:         false,
  serviceWorker: true,
  e2e:           false,
  mergeRequest:  false
};
