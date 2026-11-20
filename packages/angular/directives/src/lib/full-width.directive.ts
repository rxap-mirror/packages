import { Directive } from '@angular/core';

@Directive({
  selector: '[rxapFullWidth]',
  standalone: true,
  host: {
    style: 'width: 100%',
  },
})
export class FullWidthDirective {}
