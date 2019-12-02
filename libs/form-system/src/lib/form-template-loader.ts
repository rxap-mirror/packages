import {
  Injectable,
  isDevMode
} from '@angular/core';
import { FormDefinitionRegister } from './form-definition-register';
import { getMetadata } from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './form-definition/decorators/meta-data-keys';
import {
  Subject,
  Observable,
  from
} from 'rxjs';
import {
  startWith,
  filter,
  map,
  switchMap
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Parser } from './form-view/parser';
import { Form } from './form-view/form';

export type FormTemplate = string;

@Injectable({ providedIn: 'root' })
export class FormTemplateLoader {

  public templates = new Map<string, FormTemplate>();

  public update$ = new Subject<string>();

  public load$ = new Subject<string>();

  constructor(
    public formDefinitionRegister: FormDefinitionRegister,
    public http: HttpClient,
  ) {}

  /**
   * @deprecated
   * @internal
   * @param formId
   */
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

  public updateTemplate(formId: string, template: FormTemplate): void {
    this.templates.set(formId, template);
    this.update$.next(formId);
  }

  public async getTemplate$(formId: string): Promise<FormTemplate> {
    let template: string = this.templates.get(formId) || '';

    // if template is not cached, search for the template
    if (!template) {

      const formDefinitionType = this.formDefinitionRegister.get(formId);

      let templateUrl = getMetadata<string>(FormDefinitionMetaDataKeys.FORM_TEMPLATE_URL, formDefinitionType);
      template        = getMetadata<string>(FormDefinitionMetaDataKeys.FORM_TEMPLATE, formDefinitionType) || '';

      // if template and templateUrl are not defined
      if (!template && !templateUrl) {
        // set the default templateUrl
        templateUrl = `/assets/form-templates/${formId}.xml`;
      }

      // if templateUrl is defined
      if (templateUrl) {
        // load template from url
        try {
          template = await this.http.get(templateUrl, { responseType: 'text' }).toPromise();
        } catch (e) {
          if (isDevMode()) {
            template = '<row></row>';
          }
          // template is not availed at the specified url
          console.warn('Could not load template from url', templateUrl, e);
        }
      }

      if (!template) {
        throw new Error(`Form template not defined for form with id '${formId}'`);
      }

      this.templates.set(formId, template);

      this.load$.next(formId);

    }

    return template;

  }

  public getFormTemplate$(formId: string): Observable<Form> {
    return this.update$.pipe(
      filter(updateFormId => updateFormId === formId),
      startWith(formId),
      switchMap(() => from(this.getTemplate$(formId)).pipe(
        map(template => {
          const form = Parser.CreateFormFromXml(template);
          form.id    = formId;
          return form;
        })
      )),
    );
  }

}
