import { ControlContainer } from '@angular/forms';
import {
  AbstractControl,
  RxapFormArray,
  RxapFormControl,
  RxapFormGroup,
} from '@rxap/forms';
import { RxapFormSystemError } from '../error';

export class ExtractControlFromParentMixin {

  protected extractControlFromParent(parent: ControlContainer, controlPath: string): AbstractControl {
    if (!controlPath) {
      throw new RxapFormSystemError('The control path is empty', '');
    }

    if (!parent.control) {
      throw new RxapFormSystemError('The control property of ControlContainer is not defined', '');
    }

    const control = parent.control.get(controlPath);

    if (!control) {
      throw new RxapFormSystemError('Could not find the control instance', '');
    }

    if (!(control instanceof RxapFormControl) &&
      !(control instanceof RxapFormGroup) &&
      !(control instanceof RxapFormArray)) {
      throw new RxapFormSystemError('The extracted control is not a RxapFormControl', '');
    }

    return control;
  }

}
