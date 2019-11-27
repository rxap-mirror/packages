import { sandboxOf } from 'angular-playground';
import { RxapControlViewComponentModule } from '@rxap/form-system-dev';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapRadioButtonControlComponent } from './radio-button-control.component';
import { RxapRadioButtonControlComponentModule } from './radio-button-control.component.module';
import { ControlOptions } from '@rxap/utilities';

const options: ControlOptions<number> = [
  { value: 0, display: 'Male' },
  { value: 1, display: 'Female' }
];

export default sandboxOf(RxapRadioButtonControlComponent, {
  imports:          [
    RxapRadioButtonControlComponentModule.standalone(),
    RxapControlViewComponentModule,
    FlexLayoutModule
  ],
  declareComponent: false
}).add('default', {
  template: `<div fxLayout="column" fxLayoutGap="16px">
<rxap-radio-button-control [options]="options" label="default radio-button control" #control="rxapRadioButtonControl"></rxap-radio-button-control>
<rxap-control-view [control]="control.control"></rxap-control-view>
</div>`,
  context:  { options }
});
