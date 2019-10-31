import { Injectable } from '@angular/core';
import {
  tap,
  first
} from 'rxjs/operators';
import { FormDefinitionLoader } from './form-definition-loader';
import { FormInstance } from './form-instance';
import { FormInvalidSubmitService } from './form-invalid-submit.service';
import { FormValidSubmitService } from './form-valid-submit.service';
import { FormLoadService } from './form-load.service';

@Injectable({ providedIn: 'root' })
export class FormInstanceFactory {

  public readonly instances = new Map<string, FormInstance<any>>();

  constructor(public readonly formDefinitionLoader: FormDefinitionLoader) {}

  public buildInstance<FormValue extends object, T extends FormInstance<FormValue> = FormInstance<FormValue>>(
    formId: string,
    shared: boolean,
    formInvalidSubmit: FormInvalidSubmitService<FormValue>,
    formValidSubmit: FormValidSubmitService<FormValue>,
    formLoad: FormLoadService<FormValue>
  ): T {
    if (shared) {
      if (this.instances.has(formId)) {
        return this.instances.get(formId) as any;
      }
    }
    const formDefinition = this.formDefinitionLoader.load(formId);
    const formInstance   = new FormInstance<FormValue>(
      formDefinition,
      formInvalidSubmit,
      formValidSubmit,
      formLoad
    );
    if (shared) {
      this.instances.set(formId, formInstance);
      formInstance.formDefinition.destroy$.pipe(
        first(),
        tap(() => this.instances.delete(formId))
      ).subscribe();
    }
    return formInstance as any;
  }

}
