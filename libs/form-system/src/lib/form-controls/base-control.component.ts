import {
  Input,
  Injectable
} from '@angular/core';
import { BaseFormControl } from '../forms/form-controls/base.form-control';

@Injectable()
export class BaseControlComponent<ControlValue, FormControl extends BaseFormControl<ControlValue> = BaseFormControl<ControlValue>> {

  @Input() public control: FormControl;

}
