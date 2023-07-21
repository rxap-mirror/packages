import { FormDefinitionControl } from '../../../lib/form-definition-control';
import { AngularOptions } from '../../../lib/angular-options';

export interface FormControlOptions extends FormDefinitionControl, AngularOptions {
  formName: string;
}
