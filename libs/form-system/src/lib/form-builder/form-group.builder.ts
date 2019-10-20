import {
  Injectable,
  Injector
} from '@angular/core';
import { BaseFormGroup } from '../forms/form-groups/base.form-group';
import { FormGroupMetaData } from '../form-definition/decorators/group';
import {
  KeyValue,
  objectReducer
} from '@rxap/utilities';
import { FormDefinitionLoader } from '../form-definition-loader';

@Injectable({ providedIn: 'root' })
export class FormGroupBuilder {

  constructor(
    public readonly injector: Injector,
    public readonly formDefinitionLoader: FormDefinitionLoader
  ) {}

  public buildGroup(
    group: FormGroupMetaData,
    injector: Injector                = this.injector,
    parent: BaseFormGroup<any> | null = null
  ): BaseFormGroup<any> {
    return this.formDefinitionLoader.load(group.formDefinition, injector, parent, group.controlId).group;
  }

  public buildGroups(
    groups: FormGroupMetaData[],
    injector: Injector                = this.injector,
    parent: BaseFormGroup<any> | null = null
  ): KeyValue<BaseFormGroup<any>> {
    return groups.map(group => ({ [ group.propertyKey ]: this.buildGroup(group, injector, parent) })).reduce(objectReducer, {});
  }

}
