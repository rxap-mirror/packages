import {
  Injectable,
  Injector
} from '@angular/core';
import { BaseFormArray } from '../forms/form-arrays/base.form-array';
import { FormArrayMetaData } from '../form-definition/decorators/array';
import {
  KeyValue,
  objectReducer
} from '@rxap/utilities';
import { FormDefinitionLoader } from '../form-definition-loader';
import { BaseFormGroup } from '../forms/form-groups/base.form-group';
import { getFormDefinitionId } from '../..';

@Injectable({ providedIn: 'root' })
export class FormArrayBuilder {

  constructor(
    public readonly injector: Injector,
    public readonly formDefinitionLoader: FormDefinitionLoader
  ) {}

  public buildArray(
    array: FormArrayMetaData,
    injector                          = this.injector,
    parent: BaseFormGroup<any> | null = null
  ): BaseFormArray<any> {
    let formId: string;
    if (parent) {
      formId = parent.formId;
    } else {
      formId = getFormDefinitionId(array.formDefinition);
    }
    const formGroup = this.formDefinitionLoader.load(array.formDefinition, injector, parent).group;
    return new BaseFormArray(formId, array.controlId, formGroup, parent);
  }

  public buildArrays(
    arrays: FormArrayMetaData[],
    injector                          = this.injector,
    parent: BaseFormGroup<any> | null = null
  ): KeyValue<BaseFormArray<any>> {
    return arrays.map(array => ({ [ array.propertyKey ]: this.buildArray(array, injector, parent) })).reduce(objectReducer, {});
  }

}
