import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';

@Component({
  selector:        'rxap-form-field-icon-button',
  templateUrl:     './form-field-icon-button.component.html',
  styleUrls:       [ './form-field-icon-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldIconButtonComponent {

  @Input() public show = true;

  @Input() public icon: string | IconConfig | null = null;

  @Output() public buttonClick = new EventEmitter<void>();

}
