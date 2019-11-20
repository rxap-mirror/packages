import { sandboxOf } from 'angular-playground';
import { DateRangeControlComponent } from './date-range-control.component';
import { RxapDateRangeControlComponentModule } from './date-range-control.component.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapDateControlComponentModule } from '@rxap/form-system';
import { FormsModule } from '@angular/forms';
import { RxapControlViewComponentModule } from '@rxap/form-system-dev';

export default sandboxOf(
  DateRangeControlComponent,
  {
    imports:          [
      RxapDateRangeControlComponentModule.standalone(),
      RxapDateControlComponentModule.standalone(),
      FlexLayoutModule,
      FormsModule,
      RxapControlViewComponentModule
    ],
    declareComponent: false
  }
).add('default', {
  template: '<rxap-date-range-control label="default date range control"></rxap-date-range-control>'
}).add('set min/max', {
  template: `
  <div fxLayout="column">
  <rxap-date-range-control #control="rxapDateRangeControl" label="date range control with min/max date" [max]="max" [min]="min" fxFlex="nogrow"></rxap-date-range-control>
  <rxap-date-control label="set min date" [(ngModel)]="min" fxFlex="nogrow" ></rxap-date-control>
  <rxap-date-control label="set max date" [(ngModel)]="max" fxFlex="nogrow" ></rxap-date-control>
  <rxap-control-view [control]="control.control"></rxap-control-view>
</div>
  `,
  context:  {
    min: null,
    max: null
  }
}).add('ngModel', {
  template: `
  <div fxLayout="column">
  <rxap-date-range-control [(ngModel)]="model" #control="rxapDateRangeControl" label="date range control with min/max date" fxFlex="nogrow"></rxap-date-range-control>
  <pre>{{model | json}}</pre>
  <rxap-control-view [control]="control.control"></rxap-control-view>
</div>
  `,
  context:  {
    model: null
  }
});
