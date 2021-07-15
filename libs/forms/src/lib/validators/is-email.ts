import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isEmail } from 'class-validator';

export interface IsEmailOptions {
  /**
   * If `allow_display_name` is set to `true`, the validator will also match `Display Name <email-address>`.
   *
   * @default false
   */
  allow_display_name?: boolean | undefined;
  /**
   * If `require_display_name` is set to `true`, the validator will reject strings without the format `Display Name <email-address>`.
   *
   * @default false
   */
  require_display_name?: boolean | undefined;
  /**
   * If `allow_utf8_local_part` is set to `false`, the validator will not allow any non-English UTF8 character in email address' local part.
   *
   * @default true
   */
  allow_utf8_local_part?: boolean | undefined;
  /**
   * If `require_tld` is set to `false`, e-mail addresses without having TLD in their domain will also be matched.
   *
   * @default true
   */
  require_tld?: boolean | undefined;
  /**
   * If `ignore_max_length` is set to `true`, the validator will not check for the standard max length of an email.
   *
   * @default false
   */
  ignore_max_length?: boolean | undefined;
  /**
   * If `allow_ip_domain` is set to `true`, the validator will allow IP addresses in the host part.
   *
   * @default false
   */
  allow_ip_domain?: boolean | undefined;
  /**
   * If `domain_specific_validation` is `true`, some additional validation will be enabled,
   * e.g. disallowing certain syntactically valid email addresses that are rejected by GMail.
   *
   * @default false
   */
  domain_specific_validation?: boolean | undefined;
}

export function IsEmail({ message, options }: { message?: string, options?: IsEmailOptions }) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isEmail(control.value, options)) {
      return {
        isNumber: {
          expected: 'A email value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
