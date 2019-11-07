import {
  Injectable,
  Injector
} from '@angular/core';
import {
  tap,
  first
} from 'rxjs/operators';
import { FormDefinitionLoader } from './form-definition-loader';
import {
  FormInstance,
  FormInstanceId
} from './form-instance';
import { FormInvalidSubmitService } from './form-invalid-submit.service';
import { FormValidSubmitService } from './form-valid-submit.service';
import { FormLoadService } from './form-load.service';

export type FormId = string;

@Injectable({ providedIn: 'root' })
export class FormInstanceFactory {

  public readonly instancesGroupedByFormId = new Map<FormId, Map<FormInstanceId, FormInstance<any>>>();
  public readonly instances                = new Map<FormInstanceId, FormInstance<any>>();

  constructor(public readonly formDefinitionLoader: FormDefinitionLoader) {}

  public buildInstance<FormValue extends object, T extends FormInstance<FormValue> = FormInstance<FormValue>>(
    formId: string,
    instanceId: FormInstanceId,
    injector: Injector | null                                     = null,
    formInvalidSubmit: FormInvalidSubmitService<FormValue> | null = null,
    formValidSubmit: FormValidSubmitService<FormValue> | null     = null,
    formLoad: FormLoadService<FormValue> | null                   = null
  ): T {
    if (this.instances.has(instanceId)) {
      return this.instances.get(instanceId) as any;
    }
    const formDefinition = this.formDefinitionLoader.load(formId, injector || undefined);
    const formInstance   = new FormInstance<FormValue>(
      formDefinition,
      formInvalidSubmit,
      formValidSubmit,
      formLoad,
      instanceId
    );
    this.setFormInstance(formId, formInstance);
    formInstance.formDefinition.destroy$.pipe(
      first(),
      tap(() => this.deleteFormInstance(formId, formInstance.instanceId))
    ).subscribe();
    return formInstance as any;
  }

  public getFormInstancesByFormId(formId: FormId): Array<FormInstance<any>> {
    const instances = this.instancesGroupedByFormId.get(formId);
    if (instances) {
      return Array.from(instances.values());
    } else {
      throw new Error(`Form Instances with formId '${formId}' not found`);
    }
  }

  public getFormInstanceIdsByFormId(formId: FormId): Array<FormInstanceId> {
    const instances = this.instancesGroupedByFormId.get(formId);
    if (instances) {
      return Array.from(instances.keys());
    } else {
      throw new Error(`Form Instances with formId '${formId}' not found`);
    }
  }

  public getFormInstanceById(instanceId: FormInstanceId): FormInstance<any> | null {
    return this.instances.get(instanceId) || null;
  }

  public setFormInstance(formId: FormId, instance: FormInstance<any>): void {
    this.instances.set(instance.instanceId, instance);
    if (!this.instancesGroupedByFormId.has(formId)) {
      this.instancesGroupedByFormId.set(formId, new Map<FormInstanceId, FormInstance<any>>());
    }
    // tslint:disable-next-line:no-non-null-assertion
    const instances = this.instancesGroupedByFormId.get(formId)!;
    instances.set(instance.instanceId, instance);
  }

  public deleteFormInstance(formId: FormId, instanceId: FormInstanceId): boolean {
    const result = this.instances.delete(instanceId);
    if (!this.instancesGroupedByFormId.has(formId)) {
      return false;
    }
    // tslint:disable-next-line:no-non-null-assertion
    const instances = this.instancesGroupedByFormId.get(formId)!;
    return instances.delete(instanceId) && result;
  }

}
