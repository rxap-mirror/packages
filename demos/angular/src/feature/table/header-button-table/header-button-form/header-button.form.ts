import { FormType, RxapFormGroup, RxapForm } from '@rxap/forms';
import { Injectable } from '@angular/core';

@RxapForm('header-button')
@Injectable()
export class HeaderButtonForm implements FormType<IHeaderButtonForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IHeaderButtonForm>;
}

export interface IHeaderButtonForm {}
