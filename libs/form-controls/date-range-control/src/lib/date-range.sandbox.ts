import { sandboxOf } from 'angular-playground';
import { DateRangeControlComponent } from './date-range-control.component';
import { RxapDateRangeControlComponentModule } from './date-range-control.component.module';

export default sandboxOf(
  DateRangeControlComponent,
  {
    imports:          [
      RxapDateRangeControlComponentModule.standalone()
    ],
    declareComponent: false
  }
).add('default', {
  template: '<rxap-date-range-control></rxap-date-range-control>'
});
