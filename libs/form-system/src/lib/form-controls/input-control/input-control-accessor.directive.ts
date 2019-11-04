import {
  Directive,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { RxapInputControlComponent } from './input-control.component';
import { NgModelControlAccessorDirective } from '../ng-model-control.accessor.directive';

@Directive({
  selector:  'rxap-input-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputControlAccessorDirective),
      multi:       true
    }
  ]
})
export class InputControlAccessorDirective extends NgModelControlAccessorDirective {

  constructor(host: RxapInputControlComponent<any>) {
    super(host);
  }

}
