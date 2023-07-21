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

@RxapForm('table-header-button')
@Injectable()
export class TableHeaderButtonForm implements FormType<ITableHeaderButtonForm> {
  public readonly rxapFormGroup!: RxapFormGroup<ITableHeaderButtonForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITableHeaderButtonForm {
  name: unknown;
}
