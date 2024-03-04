import { Injectable } from '@angular/core';
import {
  FormDefinitionArray,
  FormType,
  RxapForm,
  RxapFormControl,
  RxapFormGroup,
  UseFormArrayGroup,
  UseFormControl,
  UseFormGroup,
} from '@rxap/forms';
import {
  ComplexCompanyForm,
  IComplexCompanyForm,
} from './complex-company.form';
import {
  ComplexVariableListForm,
  IComplexVariableListForm,
} from './complex-variable-list.form';

@RxapForm('complex')
@Injectable()
export class ComplexForm implements FormType<IComplexForm> {
  public readonly rxapFormGroup!: RxapFormGroup<IComplexForm>;
  @UseFormControl()
  public readonly name!: RxapFormControl<string>;
  @UseFormArrayGroup(ComplexVariableListForm, )
  public readonly variableList!: FormDefinitionArray<ComplexVariableListForm>;
  @UseFormGroup(ComplexCompanyForm, )
  public readonly company!: ComplexCompanyForm;
}

export interface IComplexForm {
  name: string;
  variableList: Array<IComplexVariableListForm>;
  company: IComplexCompanyForm;
}
