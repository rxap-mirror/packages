import { BaseFormGroup } from '../forms/form-groups/base.form-group';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  getMetadata,
  Type
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './decorators/meta-data-keys';
import { FormDefinitionMetaData } from './decorators/form-definition';
import { clone } from 'ramda';

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

  public submit$        = new Subject<void>();
  public reset$         = new Subject<void>();
  public validSubmit$   = new Subject<GroupValue>();
  public invalidSubmit$ = new Subject<any>();

  public submitValue$ = new Subject<any>();

  public init$    = new Subject<void>();
  public destroy$ = new Subject<void>();

  public rxapOnInit() {}

  public rxapOnDestroy() {}

  public async rxapOnLoad(): Promise<any> {}

  public rxapOnSubmit() {}

  public async rxapOnSubmitValid(): Promise<any> {
    return clone(this.group.value);
  }

  public rxapOnSubmitInvalid() {}

  public rxapOnSubmitError() {}
}
