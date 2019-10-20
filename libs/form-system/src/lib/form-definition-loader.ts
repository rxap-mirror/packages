import {
  Injectable,
  Injector,
  InjectFlags
} from '@angular/core';
import { FormControlBuilder } from './form-builder/form-control.builder';
import {
  RxapFormDefinition,
  getFormDefinitionId
} from './form-definition/form-definition';
import { FormDefinitionRegister } from './form-definition-register';
import { FormControlMetaData } from './form-definition/decorators/control';
import { FormGroupMetaData } from './form-definition/decorators/group';
import { FormArrayMetaData } from './form-definition/decorators/array';
import {
  getMetadata,
  Type
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './form-definition/decorators/meta-data-keys';
import { BaseFormGroup } from './forms/form-groups/base.form-group';
import { FormArrayBuilder } from './form-builder/form-array.builder';
import { FormGroupBuilder } from './form-builder/form-group.builder';

interface LoaderFormDefinitionMetaData {
  controls: FormControlMetaData<any>[];
  groups: FormGroupMetaData[];
  arrays: FormArrayMetaData[];
}

@Injectable({ providedIn: 'root' })
export class FormDefinitionLoader {

  constructor(
    public readonly formControlBuilder: FormControlBuilder,
    public readonly formGroupBuilder: FormGroupBuilder,
    public readonly formArrayBuilder: FormArrayBuilder,
    public readonly injector: Injector,
    public readonly formDefinitionRegistry: FormDefinitionRegister,
  ) {}

  public load<T extends RxapFormDefinition<any>>(formId: string, injector?: Injector, parent?: BaseFormGroup<any> | null, controlId?: string): T;
  // tslint:disable-next-line:unified-signatures
  public load<T extends RxapFormDefinition<any>>(formDefinition: Type<T>, injector?: Injector, parent?: BaseFormGroup<any> | null, controlId?: string): T;
  public load<T extends RxapFormDefinition<any>>(
    formIdOrDefinition: string | Type<T>,
    injector: Injector = this.injector,
    parent: BaseFormGroup<any> | null = null,
    controlId?: string
  ): T {

    let formDefinitionType: Type<T>;
    let formId: string;

    if (parent) {
      formId = parent.formId;
    }

    if (typeof formIdOrDefinition === 'string') {
      formDefinitionType = this.formDefinitionRegistry.get<T>(formIdOrDefinition);
      formId             = formIdOrDefinition;
    } else {
      formDefinitionType = formIdOrDefinition;
      formId             = getFormDefinitionId(formDefinitionType);
    }

    const metaData = this.extractMetaData(formDefinitionType);

    const formDefinition = injector.get(formDefinitionType, new formDefinitionType(), InjectFlags.Optional);

    const formGroup = new BaseFormGroup<any>(formId, controlId || formId, formDefinition, parent);

    const controlsMap = this.formControlBuilder.buildControls(metaData.controls, formGroup);
    const groupsMap   = this.formGroupBuilder.buildGroups(metaData.groups, injector, parent);
    const arraysMap   = this.formArrayBuilder.buildArrays(metaData.arrays, injector, parent);

    // assign created form controls to form definition instance
    Object.assign(formDefinition, controlsMap);
    Object.assign(formDefinition, groupsMap);
    Object.assign(formDefinition, arraysMap);

    // TODO : test if each control is added to formGroup

    formDefinition.group = formGroup;

    return formDefinition;
  }

  public extractMetaData(formDefinitionType: Type<RxapFormDefinition<any>>): LoaderFormDefinitionMetaData {
    return {
      groups: getMetadata(FormDefinitionMetaDataKeys.GROUP, formDefinitionType.prototype) || [],
      controls: (getMetadata<string[]>(FormDefinitionMetaDataKeys.CONTROLS, formDefinitionType.prototype) || [])
                .map(propertyKey => {
                  const controlMetaData = getMetadata<FormControlMetaData<any>>(FormDefinitionMetaDataKeys.CONTROL, formDefinitionType.prototype, propertyKey);
                  if (!controlMetaData) {
                    throw new Error(`Form control meta data for propertyKey '${propertyKey}' not defined`);
                  }
                  return controlMetaData;
                }),
      arrays: getMetadata(FormDefinitionMetaDataKeys.ARRAY, formDefinitionType.prototype) || [],
    }
  }

}
