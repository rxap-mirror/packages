import { Directive } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Directive({
  selector:  '[formControlName][parentControlContainer],[formControlGroup][parentControlContainer]',
  providers: [
    {
      provide:     ControlContainer,
      useExisting: ControlContainer
    }
  ]
})
export class ParentControlContainerDirective {}
