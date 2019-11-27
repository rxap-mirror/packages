import { sandboxOf } from 'angular-playground';
import { RxapControlViewComponentModule } from '@rxap/form-system-dev';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ControlOptions } from '@rxap/utilities';
import { RxapSelectListControlComponent } from './select-list-control.component';
import { RxapSelectListControlComponentModule } from './select-list-control.component.module';

const options: ControlOptions<number> = [
  { value: 0, display: 'Male' },
  { value: 1, display: 'Female' }
];

export default sandboxOf(RxapSelectListControlComponent, {
  imports:          [
    RxapSelectListControlComponentModule.standalone(),
    RxapControlViewComponentModule,
    FlexLayoutModule
  ],
  declareComponent: false
}).add('default', {
  template: `<div fxLayout="column" fxLayoutGap="16px">
<rxap-select-list-control [options]="options" label="default select list control" #control="rxapSelectListControl"></rxap-select-list-control>
<rxap-control-view [control]="control.control"></rxap-control-view>
</div>`,
  context:  { options }
});
