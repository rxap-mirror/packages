import { Injectable } from '@angular/core';
import { UseOptionsDataSource } from '@rxap/form-system';
import {
  FormType,
  RxapForm,
  RxapFormControl,
  RxapFormGroup,
  RxapValidators,
  UseFormControl,
} from '@rxap/forms';
import { CompanyTypeOptionsDataSource } from './data-sources/company-type-options.data-source';

@RxapForm('complex-company')
@Injectable()
export class ComplexCompanyForm implements FormType<IComplexCompanyForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IComplexCompanyForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;
  @UseFormControl({
      validators: [RxapValidators.IsUrl()]
    })
  public readonly link!: RxapFormControl<unknown>;

  @UseOptionsDataSource(CompanyTypeOptionsDataSource)
  @UseFormControl()
  public readonly companyType!: RxapFormControl<unknown>;
}

export interface IComplexCompanyForm {
  name: string;
  link: unknown;
  companyType: unknown;
}
