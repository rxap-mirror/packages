import {
  Injectable,
  Injector,
  InjectFlags
} from '@angular/core';
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
  Type,
  KeyValue,
  objectReducer,
  ProxyChangeDetection
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './form-definition/decorators/meta-data-keys';
import { BaseFormGroup } from './forms/form-groups/base.form-group';
import { ParentForm } from './forms/parent.form';
import { BaseFormControl } from './forms/form-controls/base.form-control';
import { BaseFormArray } from './forms/form-arrays/base.form-array';
import { FormStateManager } from './form-state-manager';

interface LoaderFormDefinitionMetaData {
  controls: FormControlMetaData<any>[];
  groups: FormGroupMetaData[];
  arrays: FormArrayMetaData[];
}

@Injectable({ providedIn: 'root' })
export class FormDefinitionLoader {

  constructor(
    public readonly formStateManager: FormStateManager,
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

    const formGroup = new BaseFormGroup<any>(formId, controlId || formId, formDefinition, injector, parent);

    const controlsMap = this.buildControls(metaData.controls, formGroup, injector);
    const groupsMap   = this.buildGroups(metaData.groups, injector, parent);
    const arraysMap   = this.buildArrays(metaData.arrays, injector, parent);

    // assign created form controls to form definition instance
    Object.assign(formDefinition, controlsMap);
    Object.assign(formDefinition, groupsMap);
    Object.assign(formDefinition, arraysMap);

    // TODO : test if each control is added to formGroup
    Object.values(controlsMap).forEach(control => this.formStateManager.addForm(control.controlPath, control));
    Object.values(groupsMap).forEach(group => this.formStateManager.addForm(group.controlPath, group));
    Object.values(arraysMap).forEach(array => this.formStateManager.addForm(array.controlPath, array));

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

  public buildControl(
    controlMetaData: FormControlMetaData<any>,
    parent: ParentForm<any>,
    injector: Injector = this.injector
  ): BaseFormControl<any> {
    const FormControlType: Type<BaseFormControl<any>> = controlMetaData.formControl;
    const control: BaseFormControl<any>               = ProxyChangeDetection(new FormControlType(controlMetaData.controlId, parent, injector));

    Object.assign(control, controlMetaData.properties);

    this.formStateManager.addForm(control.controlPath, control);

    return control;
  }

  public buildControls(
    controls: FormControlMetaData<any>[],
    parent: ParentForm<any>,
    injector: Injector = this.injector
  ): KeyValue<BaseFormControl<any>> {
    return controls.map(control => ({ [ control.propertyKey ]: this.buildControl(control, parent, injector) })).reduce(objectReducer, {});
  }

  public buildGroup(
    group: FormGroupMetaData,
    injector: Injector                = this.injector,
    parent: BaseFormGroup<any> | null = null
  ): BaseFormGroup<any> {
    return this.load(group.formDefinition, injector, parent, group.controlId).group;
  }

  public buildGroups(
    groups: FormGroupMetaData[],
    injector: Injector                = this.injector,
    parent: BaseFormGroup<any> | null = null
  ): KeyValue<BaseFormGroup<any>> {
    return groups.map(group => ({ [ group.propertyKey ]: this.buildGroup(group, injector, parent) })).reduce(objectReducer, {});
  }

  public buildArray(
    array: FormArrayMetaData,
    injector                          = this.injector,
    parent: BaseFormGroup<any> | null = null
  ): BaseFormArray<any, any> {
    let formId: string;
    if (parent) {
      formId = parent.formId;
    } else {
      formId = getFormDefinitionId(array.formDefinition);
    }
    const formGroup = this.load(array.formDefinition, injector, parent).group;
    return new BaseFormArray(formId, array.controlId, formGroup, injector, parent);
  }

  public buildArrays(
    arrays: FormArrayMetaData[],
    injector                          = this.injector,
    parent: BaseFormGroup<any> | null = null
  ): KeyValue<BaseFormArray<any, any>> {
    return arrays.map(array => ({ [ array.propertyKey ]: this.buildArray(array, injector, parent) })).reduce(objectReducer, {});
  }

}
