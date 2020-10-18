import { Environment } from './environment.interface';

export const environment: Environment = {
  name:          'issue',
  production:    false,
  master:        false,
  development:   true,
  issue:         true,
  stable:        false,
  staging:       false,
  local:         false,
  serviceWorker: false,
  mergeRequest:  false
};
