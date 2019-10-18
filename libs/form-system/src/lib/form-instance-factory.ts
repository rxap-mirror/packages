import { Injectable } from '@angular/core';
import {
  tap,
  first
} from 'rxjs/operators';
import { FormDefinitionLoader } from './form-definition-loader';
import { FormInstance } from './form-instance';

@Injectable({ providedIn: 'root' })
export class FormInstanceFactory {

  public readonly instances = new Map<string, FormInstance<any>>();

  constructor(public readonly formDefinitionLoader: FormDefinitionLoader) {}

  public buildInstance<V extends object, T extends FormInstance<V> = FormInstance<V>>(formId: string): T {
    if (this.instances.has(formId)) {
      return this.instances.get(formId) as any;
    }
    const formDefinition = this.formDefinitionLoader.load(formId);
    const formInstance = new FormInstance<V>(formDefinition);
    this.instances.set(formId, formInstance);
    formInstance.formDefinition.destroy$.pipe(
      first(),
      tap(() => this.instances.delete(formId))
    ).subscribe();
    return formInstance as any;
  }

}
