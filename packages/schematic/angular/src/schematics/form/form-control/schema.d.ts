import { AngularOptions } from '../../../lib/angular-options';
import { Control } from '../../../lib/form/control';

export type FormControlOptions = Control & Omit<AngularOptions, 'name'> & { formName: string; };
