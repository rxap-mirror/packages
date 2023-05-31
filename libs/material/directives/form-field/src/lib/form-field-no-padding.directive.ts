import { Directive } from '@angular/core';

@Directive({
  selector:   'mat-form-field[rxapNoPadding]',
  host:       {
    class: 'rxap-form-field-no-padding'
  },
  standalone: true
})
export class FormFieldNoPaddingDirective {}
