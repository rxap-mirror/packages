import { AngularOptions } from '../../../lib/angular-options';
import { FormGroup } from '../../../lib/form/group/form-group';

export type FormGroupOptions = FormGroup & Omit<AngularOptions, 'name'> & { formName: string; };
