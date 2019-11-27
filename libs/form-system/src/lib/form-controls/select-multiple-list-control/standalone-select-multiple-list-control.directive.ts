import {
  Directive,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StandaloneSelectControlDirective } from '../select-control/standalone-select-control.directive';

@Directive({
  selector:  'rxap-select-multiple-list-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneSelectMultipleListControlDirective),
      multi:       true
    }
  ]
})
export class StandaloneSelectMultipleListControlDirective<ControlValue>
  extends StandaloneSelectControlDirective<ControlValue> {

  public multiple = true;
  public initial  = [] as any;

}
