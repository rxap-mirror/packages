import { FormType, RxapFormGroup, RxapFormControl, UseFormControl, RxapForm } from '@rxap/forms';
import { Injectable } from '@angular/core';
import { IReferenceTreeTable } from './reference-tree-table';

@RxapForm('reference-tree-table-filter')
@Injectable()
export class ReferenceTreeTableFilterForm implements FormType<IReferenceTreeTableFilterForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IReferenceTreeTableFilterForm>;
  @UseFormControl()
  public readonly referenced!: RxapFormControl<boolean>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;
}

export type IReferenceTreeTableFilterForm = Pick<IReferenceTreeTable, 'referenced' | 'name'>;
