import {
  Injectable,
  Injector
} from '@angular/core';
import { BaseFormGroup } from '../forms/form-groups/base.form-group';
import { FormGroupMetaData } from '../form-definition/decorators/group';

@Injectable({ providedIn: 'root' })
export class FormGroupBuilder {

  constructor(public readonly injector: Injector) {}

  public buildGroups(groups: FormGroupMetaData[], injector: Injector = this.injector): { [propertyKey: string]: BaseFormGroup<any> } {
    return {};
  }

}
