import { sandboxOf } from 'angular-playground';
import { RxapDateControlComponent } from './date-control.component';
import { RxapDateControlComponentModule } from './date-control.component.module';
import { RxapControlViewComponentModule } from '@rxap/form-system-dev';

export default sandboxOf(RxapDateControlComponent, {
  imports:          [
    RxapDateControlComponentModule.standalone(),
    RxapControlViewComponentModule
  ],
  declareComponent: false
}).add('default', {
  template: `<div fxLayout="column" fxLayoutGap="16px">
<rxap-date-control label="default date control" #control="rxapDateControl"></rxap-date-control>
<rxap-control-view [control]="control.control"></rxap-control-view>
</div>`
});
