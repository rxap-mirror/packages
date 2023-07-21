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

@RxapForm('filter-table-filter')
@Injectable()
export class FilterTableFilterForm implements FormType<IFilterTableFilterForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IFilterTableFilterForm>;
  @UseFormControl()
  public readonly age!: RxapFormControl<number>;
  @UseFormControl()
  public readonly isActive!: RxapFormControl<boolean>;
  @UseFormControl()
  public readonly email!: RxapFormControl<unknown>;
  @UseFormControl()
  public readonly rating!: RxapFormControl<number>;
  @UseFormControl()
  public readonly name!: RxapFormControl<unknown>;
}

export interface IFilterTableFilterForm {
  age: number;
  isActive: boolean;
  email: unknown;
  rating: number;
  name: unknown;
}
