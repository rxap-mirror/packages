import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormFieldFormControl } from '../../../forms/form-controls/form-field.form-control';
import { Required } from '@rxap/utilities';

@Component({
  selector:        'rxap-form-field-suffix',
  templateUrl:     './form-field-suffix.component.html',
  styleUrls:       [ './form-field-suffix.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldSuffixComponent {

  public get hasIcon(): boolean {
    return !!this.control.suffixIcon;
  }

  public get hasButton(): boolean {
    return !!this.control.suffixButton;
  }

  @Input() @Required public control!: FormFieldFormControl<any>;
  @Input() public clearButton = true;

}
