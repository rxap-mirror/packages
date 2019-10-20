import { BaseFormGroup } from './form-groups/base.form-group';
import { BaseFormArray } from './form-arrays/base.form-array';

export type ParentForm<Value extends object> = BaseFormGroup<Value> | BaseFormArray<Value>
