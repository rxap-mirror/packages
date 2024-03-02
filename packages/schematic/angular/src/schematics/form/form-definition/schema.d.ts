import { AngularOptions } from '../../../lib/angular-options';
import { Control } from '../../../lib/form/control';

export interface FormDefinitionOptions extends AngularOptions {
  controlList: Array<Control>;
  standalone?: boolean;
}
