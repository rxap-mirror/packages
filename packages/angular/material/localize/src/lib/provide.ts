import { I18N_MAT_DATEPICKER_INTL_PROVIDER } from './datepicker';
import { I18N_MAT_PAGINATOR_INTL_PROVIDER } from './paginator';
import { I18N_MAT_STEPPER_INTL_PROVIDER } from './stepper';

export function ProvideI18nMatIntl() {
  return [
    I18N_MAT_DATEPICKER_INTL_PROVIDER,
    I18N_MAT_PAGINATOR_INTL_PROVIDER,
    I18N_MAT_STEPPER_INTL_PROVIDER,
  ];
}
