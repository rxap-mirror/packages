import { BaseFormArray } from './base.form-array';
import { BaseFormGroup } from '../form-groups/base.form-group';
import { Nullable } from '@rxap/utilities';

export class BaseGroupFormArray<GroupItemValue extends object,
  FormGroup extends BaseFormGroup<GroupItemValue> = BaseFormGroup<GroupItemValue>> extends BaseFormArray<Nullable<GroupItemValue>, FormGroup> {}
