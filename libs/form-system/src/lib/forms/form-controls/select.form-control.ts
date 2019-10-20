import { FormFieldFormControl } from './form-field.form-control';
import {
  ControlOptions,
  hasIdentifierProperty,
  getIdentifierPropertyValue,
  ControlOption
} from '@rxap/utilities';
import { equals } from 'ramda';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';

export function RxapControlOptions<ControlValue>(...options: Array<ControlOption<ControlValue> | string>) {
  return RxapControlProperty('options', options.map(option => {
    if (typeof option === 'string') {
      return { value: option, display: option };
    }
    return option;
  }));
}

export function RxapSelectControl() {
  return SetFormControlMeta('formControl', SelectFormControl);
}

export function RxapSelectMultipleControl() {
  return function(target: any, propertyKey: string) {
    RxapSelectControl()(target, propertyKey);
    RxapControlProperty('multiple', true)(target, propertyKey);
    RxapControlProperty('initial', [])(target, propertyKey);
  };
}

export class SelectFormControl<ControlValue>
  extends FormFieldFormControl<ControlValue> {

  public options: ControlOptions<ControlValue> = [];

  public multiple = false;

  public componentId = RxapFormControlComponentIds.SELECT;

  public compareWith(optionValue: ControlValue, selectValue: ControlValue) {
    if (selectValue) {
      if (typeof selectValue === 'object') {
        if (hasIdentifierProperty(selectValue)) {
          return getIdentifierPropertyValue(selectValue) === getIdentifierPropertyValue(optionValue);
        }
        return equals(selectValue, optionValue);
      } else {
        return optionValue === selectValue;
      }
    }

    return false;
  }

}
