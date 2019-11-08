import { FormFieldFormControl } from './form-field.form-control';
import {
  ControlOptions,
  hasIdentifierProperty,
  getIdentifierPropertyValue,
  ControlOption,
  Type
} from '@rxap/utilities';
import { equals } from 'ramda';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { tap } from 'rxjs/operators';

export function RxapControlOptions<ControlValue>(...options: Array<ControlOption<ControlValue> | string>) {
  return RxapControlProperty('options', options.map(option => {
    if (typeof option === 'string') {
      return { value: option, display: option };
    }
    return option;
  }).sort((a, b) => a.display.localeCompare(b.display)));
}

export function RxapSelectControl(optionsDataSource: OptionsDataSourceToken<any> | null = null) {
  return function(target: any, propertyKey: string) {
    SetFormControlMeta('formControl', SelectFormControl)(target, propertyKey);
    RxapControlProperty('OptionsDataSourceToken', optionsDataSource)(target, propertyKey);
  };
}

export function RxapSelectMultipleControl(optionsDataSource: OptionsDataSourceToken<any> | null = null) {
  return function(target: any, propertyKey: string) {
    RxapSelectControl(optionsDataSource)(target, propertyKey);
    RxapControlProperty('multiple', true)(target, propertyKey);
    RxapControlProperty('initial', [])(target, propertyKey);
  };
}

export interface SelectOptionsDataSource<ControlValue> {

  getOptions(params?: { filterValue?: string, page?: number }): Observable<ControlOptions<ControlValue>>;

}

export type OptionsDataSourceToken<ControlValue> = InjectionToken<SelectOptionsDataSource<ControlValue>> | Type<SelectOptionsDataSource<ControlValue>>

export class SelectFormControl<ControlValue>
  extends FormFieldFormControl<ControlValue> {

  public multiple            = false;
  public componentId: string = RxapFormControlComponentIds.SELECT;

  public set options(value: ControlOptions<ControlValue>) {
    this._options = value.sort((a, b) => this.sort(a, b));
  }

  public get unselectedOptions(): ControlOptions<ControlValue> {
    return this.options.filter(
      option => !(this.multiple ? (this.value as any as any[]).some(v => this.compareWith(option.value, v)) : this.compareWith(option.value, this.value)));
  }

  public get selectedOptions(): ControlOptions<ControlValue> {
    return this.options.filter(
      option => this.multiple ? (this.value as any as any[]).some(v => this.compareWith(option.value, v)) : this.compareWith(option.value, this.value));
  }

  public get options(): ControlOptions<ControlValue> {
    return this._options;
  }

  public OptionsDataSourceToken: OptionsDataSourceToken<ControlValue> | null = null;

  protected _options: ControlOptions<ControlValue> = [];

  public rxapOnInit(): void {
    super.rxapOnInit();
    this.handelOptionsDataSource();
  }

  public handelOptionsDataSource() {
    if (this.OptionsDataSourceToken) {
      const optionsDataSource: SelectOptionsDataSource<ControlValue> = this.injector.get(this.OptionsDataSourceToken);
      this._subscriptions.add(
        optionsDataSource.getOptions().pipe(
          tap(options => this.options = options),
          tap(() => this.updateView$.next())
        ).subscribe()
      );
    }
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
