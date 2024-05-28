import {
  FormType,
  RxapForm,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
  RxapValidators,
} from '@rxap/forms';
import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { IsActiveOptionsDataSource } from './data-sources/is-active-options.data-source';
import { UseOptionsDataSource } from '@rxap/form-system';
import { IFilterTable } from './filter-table';

@RxapForm('filter-table-filter')
@Injectable()
export class FilterTableFilterForm implements FormType<IFilterTableFilterForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IFilterTableFilterForm>;
  @UseFormControl()
  public readonly age!: RxapFormControl<number>;

  @UseOptionsDataSource(IsActiveOptionsDataSource)
  @UseFormControl()
  public readonly isActive!: RxapFormControl<boolean>;
  @UseFormControl()
  public readonly email!: RxapFormControl<unknown>;
  @UseFormControl()
  public readonly rating!: RxapFormControl<number>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;
}

export type IFilterTableFilterForm = Pick<
  IFilterTable,
  'name' | 'age' | 'isActive' | 'email' | 'rating'
>;
