import { FormType, RxapFormGroup, RxapForm } from '@rxap/forms';
import { Injectable } from '@angular/core';

@RxapForm('maximum-tree')
@Injectable()
export class MaximumTreeForm implements FormType<IMaximumTreeForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IMaximumTreeForm>;
}

export interface IMaximumTreeForm {}
