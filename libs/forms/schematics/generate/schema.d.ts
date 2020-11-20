import { FormElement } from './elements/form.element';

export interface GenerateSchema {
  project: string;
  path: string;
  template: string;
  openApiModule: string;
  formElement?: FormElement;
  name?: string;
  flat?: boolean;
  organizeImports: boolean;
  fixImports: boolean;
  format: boolean;
  overwrite: boolean;
}
