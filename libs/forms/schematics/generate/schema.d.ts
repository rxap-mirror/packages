import { FormElement } from './elements/form.element';

export interface GenerateSchema {
  project: string;
  path: string;
  template: string;
  openApiModule: string;
  component: boolean;
  formElement?: FormElement;
}
