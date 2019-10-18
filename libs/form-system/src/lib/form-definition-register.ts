import {
  Injectable,
  Type
} from '@angular/core';
import { RxapFormDefinition } from './form-definition/form-definition';
import { getMetadata } from '@rxap/utilities';
import { FormDefinitionMetaData } from './form-definition/decorators/form-definition';
import { FormDefinitionMetaDataKeys } from './form-definition/decorators/meta-data-keys';

@Injectable({ providedIn: 'root' })
export class FormDefinitionRegister {

  public readonly formDefinitions = new Map<string, Type<RxapFormDefinition<any>>>();

  public register(formDefinitionType: Type<RxapFormDefinition<any>>, formId: string = this.extractFormId(formDefinitionType)) {
    if (!formId) {
      throw new Error('Can not register a form definition without an formId');
    }
    this.formDefinitions.set(formId, formDefinitionType);
  }

  public extractFormId(formDefinitionType: Type<RxapFormDefinition<any>>): string {
    const formDefinitionMetaData = getMetadata<FormDefinitionMetaData>(FormDefinitionMetaDataKeys.FORM_DEFINITION, formDefinitionType) || null;
    return formDefinitionMetaData && formDefinitionMetaData.formId || null
  }

  public has(formId: string): boolean {
    return this.formDefinitions.has(formId);
  }

  public get<T extends RxapFormDefinition<any>>(formId: string): Type<T> {
    if (!this.has(formId)) {
      throw new Error(`Form definition with form id '${formId}' is not registered`);
    }
    return this.formDefinitions.get(formId) as any;
  }

}
