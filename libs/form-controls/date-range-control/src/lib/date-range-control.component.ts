import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  NgModelControlComponent,
  RXAP_CONTROL_COMPONENT,
  OnSetControl
} from '@rxap/form-system';
import { DateRangeFormControl } from './date-range.form-control';
import { RxapComponent } from '@rxap/component-system';

export const RXAP_DATE_RANGE_CONTROL = 'rxap-date-range-control';

@RxapComponent(RXAP_DATE_RANGE_CONTROL)
@Component({
  selector:        'rxap-date-range-control',
  templateUrl:     './date-range-control.component.html',
  styleUrls:       [ './date-range-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs:        'rxapDateRangeControl',
  providers:       [
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: DateRangeControlComponent
    }
  ],
  encapsulation:   ViewEncapsulation.None
})
export class DateRangeControlComponent
  extends NgModelControlComponent<number, DateRangeFormControl>
  implements OnSetControl {

  @ViewChild('dateInput', { static: true })
  public dateInput!: ElementRef;

  public rxapOnSetControl(): void {
    this.control.initLightpick(this.dateInput.nativeElement);
  }

}
