import { sandboxOf } from 'angular-playground';
import { RxapControlViewComponentModule } from '@rxap/form-system-dev';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ControlOptions } from '@rxap/utilities';
import { RxapSelectMultipleListControlComponentModule } from './select-multiple-list-control.component.module';
import { RxapSelectMultipleListControlComponent } from './select-multiple-list-control.component';

const options: ControlOptions<number> = [
  { value: 0, display: 'Male' },
  { value: 1, display: 'Female' }
];

export default sandboxOf(RxapSelectMultipleListControlComponent, {
  imports:          [
    RxapSelectMultipleListControlComponentModule.standalone(),
    RxapControlViewComponentModule,
    FlexLayoutModule
  ],
  declareComponent: false
}).add('default', {
  template: `<div fxLayout="column" fxLayoutGap="16px">
<rxap-select-multiple-list-control [options]="options" label="default select list control" #control="rxapSelectMultipleListControl"></rxap-select-multiple-list-control>
<rxap-control-view [control]="control.control"></rxap-control-view>
</div>`,
  context:  { options }
});
