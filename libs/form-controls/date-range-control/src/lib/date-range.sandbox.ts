import { sandboxOf } from 'angular-playground';
import { DateRangeControlComponent } from './date-range-control.component';
import { RxapDateRangeControlComponentModule } from './date-range-control.component.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapDateControlComponentModule } from '@rxap/form-system';
import { FormsModule } from '@angular/forms';

export default sandboxOf(
  DateRangeControlComponent,
  {
    imports:          [
      RxapDateRangeControlComponentModule.standalone(),
      RxapDateControlComponentModule.standalone(),
      FlexLayoutModule,
      FormsModule
    ],
    declareComponent: false
  }
).add('default', {
  template: '<rxap-date-range-control label="default date range control"></rxap-date-range-control>'
}).add('set min', {
  template: `
  <div fxLayout="column">
  <rxap-date-range-control [min]="min" fxFlex="nogrow"></rxap-date-range-control>
  <rxap-date-control [(ngModel)]="min" fxFlex="nogrow" ></rxap-date-control>
</div>
  `,
  context:  {
    min: null
  }
});
