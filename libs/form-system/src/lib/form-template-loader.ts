import { Injectable } from '@angular/core';
import { FormDefinitionRegister } from './form-definition-register';
import { getMetadata } from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './form-definition/decorators/meta-data-keys';
import { Layout } from './form-view/layout';
import { FromXml } from './form-view/element';

@Injectable({ providedIn: 'root' })
export class FormTemplateLoader {

  constructor(
    public formDefinitionRegister: FormDefinitionRegister,
  ) {}

  public getTemplate(formId: string): string {
    const formDefinitionType = this.formDefinitionRegister.get(formId);

    const template = getMetadata<string>(FormDefinitionMetaDataKeys.FORM_TEMPLATE, formDefinitionType);

    if (!template) {
      throw new Error(`Form template not defined for '${formId}'`);
    }

    return template;
  }

  public getLayout(formId: string): Layout {
    return FromXml(this.getTemplate(formId));
  }

}
