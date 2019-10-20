import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector:        'rxap-form-field-clear-button',
  templateUrl:     './form-field-clear-button.component.html',
  styleUrls:       [ './form-field-clear-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldClearButtonComponent {
  @Input() public hasValue = false;

  @Output() public buttonClick = new EventEmitter<void>();

}
