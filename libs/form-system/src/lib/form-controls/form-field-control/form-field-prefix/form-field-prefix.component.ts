import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormFieldFormControl } from '../../../forms/form-controls/form-field.form-control';

@Component({
  selector:        'rxap-form-field-prefix',
  templateUrl:     './form-field-prefix.component.html',
  styleUrls:       [ './form-field-prefix.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldPrefixComponent {

  public get hasIcon(): boolean {
    return !!this.control.prefixIcon;
  }

  public get hasButton(): boolean {
    return !!this.control.prefixButton;
  }

  @Input() public control: FormFieldFormControl<any>;

}
