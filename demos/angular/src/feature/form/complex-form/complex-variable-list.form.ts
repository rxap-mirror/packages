import { Injectable } from '@angular/core';
import {
  FormType,
  RxapForm,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
} from '@rxap/forms';

@RxapForm('complex-variable-list')
@Injectable()
export class ComplexVariableListForm implements FormType<IComplexVariableListForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IComplexVariableListForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;
  @UseFormControl()
  public readonly required!: RxapFormControl<unknown>;
}

export interface IComplexVariableListForm {
  name: string;
  required: unknown;
}
