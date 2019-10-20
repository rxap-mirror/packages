import { Injectable } from '@angular/core';
import { FormDefinitionRegister } from './form-definition-register';
import { getMetadata } from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './form-definition/decorators/meta-data-keys';
import { Layout } from './form-view/layout';
import { FromXml } from './form-view/element';
import {
  Subject,
  Observable
} from 'rxjs';
import {
  startWith,
  filter,
  map
} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FormTemplateLoader {

  public templates = new Map<string, string>();

  public update$ = new Subject<string>();

  public load$ = new Subject<string>();

  constructor(
    public formDefinitionRegister: FormDefinitionRegister,
  ) {}

  public getTemplate(formId: string): string {

    if (this.templates.has(formId)) {
      // tslint:disable-next-line:no-non-null-assertion
      return this.templates.get(formId)!;
    }

    const formDefinitionType = this.formDefinitionRegister.get(formId);

    const template = getMetadata<string>(FormDefinitionMetaDataKeys.FORM_TEMPLATE, formDefinitionType);

    if (!template) {
      throw new Error(`Form template not defined for '${formId}'`);
    }

    this.templates.set(formId, template);

    this.load$.next(formId);

    return template;
  }

  public getLayout(formId: string): Layout {
    const layout = FromXml(this.getTemplate(formId));
    layout.setFormId(formId);
    return layout;
  }

  public updateTemplate(formId: string, template: string): void {
    this.templates.set(formId, template);
    this.update$.next(formId);
  }

  public getLayout$(formId: string): Observable<Layout> {
    return this.update$.pipe(
      filter(updateFormId => updateFormId === formId),
      startWith(formId),
      map(() => this.getLayout(formId))
    );
  }

}
