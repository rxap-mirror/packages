import { BaseFormGroup } from '../forms/form-groups/base.form-group';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  getMetadata,
  Type
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './decorators/meta-data-keys';
import { FormDefinitionMetaData } from './decorators/form-definition';

export function getFormDefinitionId(formDefinitionType: Type<RxapFormDefinition<any>>) {
  const formDefinitionMetaData: FormDefinitionMetaData | null = getMetadata<FormDefinitionMetaData>(
    FormDefinitionMetaDataKeys.FORM_DEFINITION,
    formDefinitionType
  );
  if (!formDefinitionMetaData) {
    throw new Error('FormDefinition Constructor has not a meta data definition');
  }
  if (!formDefinitionMetaData.formId) {
    throw new Error('Form definition meta data has not a formId');
  }
  return formDefinitionMetaData.formId;
}

@Injectable({ providedIn: 'root' })
export class RxapFormDefinition<GroupValue extends object> {

  public static TestInstance<FormValue extends object>() {
    return new RxapFormDefinition<FormValue>();
  }

  public group!: BaseFormGroup<GroupValue>;

  public submit$ = new Subject();
  public reset$ = new Subject();

  public validSubmit$ = new Subject();
  public invalidSubmit$ = new Subject();
  public init$ = new Subject();
  public destroy$ = new Subject();

  public rxapOnInit() {}

  public rxapOnDestroy() {}

  public rxapOnSubmit() {}

  public rxapOnSubmitValid() {}

  public rxapOnSubmitInvalid() {}

  public rxapOnSubmitError() {}
}
