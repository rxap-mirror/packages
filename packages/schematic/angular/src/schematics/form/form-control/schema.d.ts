import { AngularOptions } from '../../../lib/angular-options';
import { FormControl } from '../../../lib/form/control/form-control';

export type FormControlOptions = FormControl & Omit<AngularOptions, 'name'> & { formName: string; };
