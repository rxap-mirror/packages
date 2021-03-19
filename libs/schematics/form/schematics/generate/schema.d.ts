import { FormElement } from './elements/form.element';

export interface GenerateSchema {
  project: string;
  path: string | undefined;
  template: string;
  openApiModule: string | undefined;
  formElement?: FormElement;
  name: string | undefined;
  flat?: boolean;
  organizeImports: boolean;
  fixImports: boolean;
  format: boolean;
  overwrite: boolean | undefined;
  templateBasePath: string | undefined;
}
