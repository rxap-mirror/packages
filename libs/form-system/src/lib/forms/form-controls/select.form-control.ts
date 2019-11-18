import {
  FormFieldFormControl,
  IFormFieldFormControl
} from './form-field.form-control';
import {
  ControlOptions,
  hasIdentifierProperty,
  getIdentifierPropertyValue,
  ControlOption,
  Type,
  DeleteUndefinedProperties
} from '@rxap/utilities';
import { equals } from 'ramda';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BaseForm } from '../base.form';
import { BaseFormGroup } from '../form-groups/base.form-group';

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
    RxapControlProperty('optionsDataSource', optionsDataSource)(target, propertyKey);
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

export interface ISelectFormControl<ControlValue> extends IFormFieldFormControl<ControlValue> {
  multiple: boolean;
  options: ControlOptions<ControlValue>;
  optionsDataSource: OptionsDataSourceToken<ControlValue> | null;
}

export type OptionsDataSourceToken<ControlValue> = InjectionToken<SelectOptionsDataSource<ControlValue>> | Type<SelectOptionsDataSource<ControlValue>>

export const OPTIONS_DATA_SOURCE_SUBSCRIPTION = 'options-data-source';

export class SelectFormControl<ControlValue>
  extends FormFieldFormControl<ControlValue> {

  public static EMPTY(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): SelectFormControl<any> {
    return new SelectFormControl<any>('control', parent, null as any);
  }

  public static STANDALONE<ControlValue>(options: Partial<ISelectFormControl<ControlValue>> = {}): SelectFormControl<ControlValue> {
    const control       = SelectFormControl.EMPTY();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, DeleteUndefinedProperties(options));
    return control;
  }

  public multiple            = false;
  public componentId: string = RxapFormControlComponentIds.SELECT;

  public set options(value: ControlOptions<ControlValue>) {
    this._options = value.sort((a, b) => this.sort(a, b));
    this.updateView$.next();
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

  public optionsDataSource: OptionsDataSourceToken<ControlValue> | null = null;

  protected _options: ControlOptions<ControlValue> = [];

  public rxapOnInit(): void {
    super.rxapOnInit();
    this.handelOptionsDataSource(this.optionsDataSource);
  }

  public addOption(option: ControlOption<ControlValue>) {
    if (this._options.every(o => !this.compareWith(o.value, option.value))) {
      this._options.unshift(option);
      this.updateView$.next();
    }
  }

  public removeOption(option: ControlOption<ControlValue>) {
    this._options.splice(this._options.findIndex(o => this.compareWith(o.value, option.value)), 1);
    this.updateView$.next();
  }

  public clearOptions(): void {
    this._options = [];
    this.updateView$.next();
  }

  public handelOptionsDataSource(optionsDataSourceToken: OptionsDataSourceToken<ControlValue> | null) {
    if (this.optionsDataSource !== optionsDataSourceToken || !this._subscriptions.has(OPTIONS_DATA_SOURCE_SUBSCRIPTION)) {
      if (optionsDataSourceToken) {
        this._subscriptions.reset(OPTIONS_DATA_SOURCE_SUBSCRIPTION);
        this.optionsDataSource = optionsDataSourceToken;
        this.clearOptions();
        const optionsDataSource: SelectOptionsDataSource<ControlValue> = this.injector.get(this.optionsDataSource);
        this._subscriptions.add(
          OPTIONS_DATA_SOURCE_SUBSCRIPTION,
          optionsDataSource.getOptions().pipe(
            // merge with existing options
            // if option already exists -> skip
            tap(options => options.forEach(option => this.addOption(option))),
            // force options filter
            tap(() => this.options = this.options),
            tap(() => this.updateView$.next())
          ).subscribe()
        );
      }
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
