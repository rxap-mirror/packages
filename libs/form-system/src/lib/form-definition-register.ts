import {
  Injectable,
  Type
} from '@angular/core';
import {
  RxapFormDefinition,
  getFormDefinitionId
} from './form-definition/form-definition';

@Injectable({ providedIn: 'root' })
export class FormDefinitionRegister {

  public readonly formDefinitions = new Map<string, Type<RxapFormDefinition<any>>>();

  public register(formDefinitionType: Type<RxapFormDefinition<any>>, formId: string = getFormDefinitionId(formDefinitionType)) {
    if (!formId) {
      throw new Error('Can not register a form definition without an formId');
    }
    this.formDefinitions.set(formId, formDefinitionType);
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
