import { FormDefinitionControl } from '../../../lib/form-definition-control';
import { AngularOptions } from '../../../lib/angular-options';

export interface FormDefinitionOptions extends AngularOptions {
  controlList: Array<string | FormDefinitionControl>;
}
