import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';

@Component({
  selector:        'rxap-form-field-icon',
  templateUrl:     './form-field-icon.component.html',
  styleUrls:       [ './form-field-icon.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldIconComponent {

  public get isSimpleIcon(): boolean {
    return typeof this.icon === 'string';
  }

  @Input() public icon: string | IconConfig | null = null;

}
