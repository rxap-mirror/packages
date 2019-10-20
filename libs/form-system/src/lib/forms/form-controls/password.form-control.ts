import {
  InputFormControl,
  InputTypes
} from './input.form-control';
import { IconConfig } from '@rxap/utilities';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';

export function RxapPasswordControl() {
  return SetFormControlMeta('formControl', PasswordFormControl);
}

export class PasswordFormControl extends InputFormControl<string> {

  public type = InputTypes.PASSWORD;

  public showPasswordIcon: IconConfig = {
    svgIcon: 'eye'
  };

  public hidePasswordIcon: IconConfig = {
    svgIcon: 'eye-off'
  };

  public onSuffixButtonClick() {
    if (this.type === InputTypes.PASSWORD) {
      this.suffixButton = this.hidePasswordIcon;
      this.type         = InputTypes.TEXT;
    } else {
      this.suffixButton = this.showPasswordIcon;
      this.type         = InputTypes.PASSWORD;
    }
    this.updateView$.next();
  }

  public suffixButton = this.showPasswordIcon;

}
