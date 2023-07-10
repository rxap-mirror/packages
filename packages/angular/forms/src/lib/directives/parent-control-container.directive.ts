import {Directive} from '@angular/core';
import {ControlContainer} from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[formControlName][parentControlContainer],[formControlGroup][parentControlContainer]',
  providers: [
    {
      provide: ControlContainer,
      useExisting: ControlContainer,
    },
  ],
  standalone: true,
})
export class ParentControlContainerDirective {
}
