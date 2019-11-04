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
  }).sort((a, b) => a.display.localeCompare(b.display)));
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

  public get unselectedOptions(): ControlOptions<ControlValue> {
    return this.options.filter(
      option => !(this.multiple ? (this.value as any as any[]).some(v => this.compareWith(option.value, v)) : this.compareWith(option.value, this.value)));
  }

  public get selectedOptions(): ControlOptions<ControlValue> {
    return this.options.filter(
      option => this.multiple ? (this.value as any as any[]).some(v => this.compareWith(option.value, v)) : this.compareWith(option.value, this.value));
  }

  private _options: ControlOptions<ControlValue> = [];

  public get options(): ControlOptions<ControlValue> {
    return this._options;
  }

  public multiple = false;

  public componentId = RxapFormControlComponentIds.SELECT;

  public set options(value: ControlOptions<ControlValue>) {
    this._options = value.sort(this.sort);
  }

  public selectOption(selectValue: ControlValue) {
    if (this.multiple) {
      this.setValue([ selectValue, ...(this.value as any) ] as any);
    } else {
      this.setValue(selectValue);
    }
  }

  public deselectOption(deselectValue: ControlValue) {
    if (this.multiple) {
      this.setValue((this.value as any as any[]).filter(value => !this.compareWith(value, deselectValue)) as any);
    } else {
      this.setValue(null);
    }
  }

  public sort(a: ControlOption<ControlValue>, b: ControlOption<ControlValue>): number {
    return a.display.localeCompare(b.display);
  }

  public trackBy(index: number, item: ControlOption<ControlValue>) {
    const value: any = item.value;
    if (value !== null && value.hasOwnProperty('id')) {
      return value.id;
    }
    if (typeof value !== 'object') {
      return value;
    }
    return index;
  }

  public compareWith(optionValue: ControlValue, selectValue: ControlValue | null): boolean {
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
