import { BaseFormArray } from './base.form-array';
import { BaseFormControl } from '../form-controls/base.form-control';

export class BaseControlFormArray<ControlItemValue,
  FormControl extends BaseFormControl<ControlItemValue> = BaseFormControl<ControlItemValue>> extends BaseFormArray<ControlItemValue | null, FormControl> {}
