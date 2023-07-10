import { Directive } from '@angular/core';

@Directive({
  selector: 'mat-form-field[rxapNoPadding]',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'rxap-form-field-no-padding',
  },
  standalone: true,
})
export class FormFieldNoPaddingDirective {
}
