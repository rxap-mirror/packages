import {
  Injectable,
  Injector,
  Type
} from '@angular/core';
import { FormControlBuilder } from './form-builder/form-control.builder';
import { FormGroupBuilder } from './form-builder/form-group.builder';
import { FormArrayBuilder } from './form-builder/form-array.builder';
import { RxapFormDefinition } from './form-definition/form-definition';
import { FormDefinitionRegister } from './form-definition-register';
import { FormControlMetaData } from './form-definition/decorators/control';
import { FormGroupMetaData } from './form-definition/decorators/group';
import { FormArrayMetaData } from './form-definition/decorators/array';
import {
  getMetadata,
  getMetadataKeys
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './form-definition/decorators/meta-data-keys';
import { BaseFormGroup } from './forms/form-groups/base.form-group';

interface FormDefinitionMetaData {
  controls: FormControlMetaData<any>[];
  groups: FormGroupMetaData[];
  arrays: FormArrayMetaData[];
}

@Injectable({ providedIn: 'root' })
export class FormDefinitionLoader {

  constructor(
    public readonly formControlBuilder: FormControlBuilder,
    // public readonly formGroupBuilder: FormGroupBuilder,
    // public readonly formArrayBuilder: FormArrayBuilder,
    public readonly injector: Injector,
    public readonly formDefinitionRegistry: FormDefinitionRegister,
  ) {}

  public load<T extends RxapFormDefinition<any>>(formId: string, injector?: Injector): T;
  public load<T extends RxapFormDefinition<any>>(formDefinition: Type<T>, injector?: Injector): T;
  public load<T extends RxapFormDefinition<any>>(formIdOrDefinition: string | Type<T>, injector: Injector = this.injector): T {

    let formDefinitionType: Type<T>;

    if (typeof formIdOrDefinition === 'string') {
      formDefinitionType = this.formDefinitionRegistry.get<T>(formIdOrDefinition);
    } else {
      formDefinitionType = formIdOrDefinition;
    }

    const metaData = this.extractMetaData(formDefinitionType); /*?*/

    const controlsMap = this.formControlBuilder.buildControls(metaData.controls, null); /*?*/
    // const groupsMap = this.formGroupBuilder.buildGroups(metaData.groups, injector);
    // const arraysMap = this.formArrayBuilder.getArrays(metaData.arrays, injector);

    const formDefinition = injector.get(formDefinitionType);

    // assign created form controls to form definition instance
    Object.assign(formDefinition, controlsMap);
    // Object.assign(formDefinition, groupsMap);
    // Object.assign(formDefinition, arraysMap);

    const group = new BaseFormGroup<any>();

    Object.values(controlsMap).forEach(control => group.addControl(control.controlId, control));

    formDefinition.group = group;

    return formDefinition;
  }

  public extractMetaData(formDefinitionType: Type<RxapFormDefinition<any>>): FormDefinitionMetaData {
    return {
      groups: getMetadata(FormDefinitionMetaDataKeys.GROUP, formDefinitionType.prototype) || [],
      controls: getMetadata(FormDefinitionMetaDataKeys.CONTROLS, formDefinitionType.prototype) || [],
      arrays: getMetadata(FormDefinitionMetaDataKeys.ARRAY, formDefinitionType.prototype) || [],
    }
  }

}
