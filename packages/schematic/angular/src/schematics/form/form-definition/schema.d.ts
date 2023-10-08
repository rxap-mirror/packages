import { AngularOptions } from '../../../lib/angular-options';
import { FormDefinitionControl } from '../../../lib/form-definition-control';

export interface FormDefinitionOptions extends AngularOptions {
  controlList: Array<string | FormDefinitionControl>;
  standalone?: boolean;
}
