import { sandboxOf } from 'angular-playground';
import { RxapSelectControlComponent } from './select-control.component';
import { RxapSelectControlComponentModule } from './select-control.component.module';
import { RxapControlViewComponentModule } from '@rxap/form-system-dev';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ControlOptions } from '@rxap/utilities';

const options: ControlOptions<number> = [
  { value: 0, display: 'Male' },
  { value: 1, display: 'Female' }
];

export default sandboxOf(RxapSelectControlComponent, {
  imports:          [
    RxapSelectControlComponentModule.standalone(),
    RxapControlViewComponentModule,
    FlexLayoutModule
  ],
  declareComponent: false
}).add('default', {
  template: `<div fxLayout="column" fxLayoutGap="16px">
<rxap-select-control [options]="options" label="default select control" #control="rxapSelectControl"></rxap-select-control>
<rxap-control-view [control]="control.control"></rxap-control-view>
</div>`,
  context:  { options }
});
