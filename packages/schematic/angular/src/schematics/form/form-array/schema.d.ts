import { AngularOptions } from '../../../lib/angular-options';
import { FormArray } from '../../../lib/form/array/form-array';

export type FormArrayOptions = FormArray & Omit<AngularOptions, 'name'> & { formName: string; };
