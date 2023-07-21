import {
  FormType,
  RxapForm,
  RxapFormGroup,
  RxapFormControl,
  UseFormControl,
  RxapValidators,
} from '@rxap/forms';
import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

@RxapForm('edit-data-grid-demo')
@Injectable()
export class EditDataGridDemoForm implements FormType<IEditDataGridDemoForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IEditDataGridDemoForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<unknown>;
  @UseFormControl()
  public readonly age!: RxapFormControl<number>;
  @UseFormControl()
  public readonly isActive!: RxapFormControl<boolean>;
  @UseFormControl()
  public readonly email!: RxapFormControl<unknown>;
  @UseFormControl()
  public readonly rating!: RxapFormControl<number>;
  @UseFormControl()
  public readonly accountStatus!: RxapFormControl<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IEditDataGridDemoForm {
  name: unknown;
  age: number;
  isActive: boolean;
  email: unknown;
  rating: number;
  accountStatus: unknown;
}
