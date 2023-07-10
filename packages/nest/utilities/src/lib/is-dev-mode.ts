import {Environment} from './environment';

export const RXAP_GLOBAL_STATE: { environment: Environment | null } = {environment: null};

/**
 * Used to check if the application is in dev mode.
 *
 * !!! The method can only be used inside nest classes: Service, Controller, ...
 *
 * If returns null the environment is unknown
 *
 */
export function IsDevMode(): boolean | null {
  if (RXAP_GLOBAL_STATE.environment === null) {
    return null;
  }
  return !RXAP_GLOBAL_STATE.environment.production;
}
