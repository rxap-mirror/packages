import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isURL } from 'class-validator';

export interface IsURLOptions {
  /**
   * @default ['http','https','ftp']
   */
  protocols?: string[] | undefined;
  /**
   * @default true
   */
  require_tld?: boolean | undefined;
  /**
   * @default false
   */
  require_protocol?: boolean | undefined;
  /**
   * @default true
   */
  require_host?: boolean | undefined;
  /**
   * if set as true isURL will check if port is present in the URL
   * @default false
   */
  require_port?: boolean | undefined;
  /**
   * @default true
   */
  require_valid_protocol?: boolean | undefined;
  /**
   * @default false
   */
  allow_underscores?: boolean | undefined;
  /**
   * @default false
   */
  host_whitelist?: Array<string | RegExp> | undefined;
  /**
   * @default false
   */
  host_blacklist?: Array<string | RegExp> | undefined;
  /**
   * @default false
   */
  allow_trailing_dot?: boolean | undefined;
  /**
   * @default false
   */
  allow_protocol_relative_urls?: boolean | undefined;
  /**
   * @default false
   */
  disallow_auth?: boolean | undefined;
}

export function IsUrl({ message, options }: { message?: string, options?: IsURLOptions }) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isURL(control.value, options)) {
      return {
        isNumber: {
          expected: 'A url value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
