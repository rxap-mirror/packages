import { RxapCheckboxControlComponent } from './checkbox-control.component';
import { sandboxOf } from 'angular-playground';
import { RxapCheckboxControlComponentModule } from './checkbox-control.component.module';
import { RxapControlViewComponentModule } from '@rxap/form-system-dev';
import { FlexLayoutModule } from '@angular/flex-layout';

export default sandboxOf(RxapCheckboxControlComponent, {
  imports:          [
    RxapCheckboxControlComponentModule.standalone(),
    RxapControlViewComponentModule,
    FlexLayoutModule
  ],
  declareComponent: false
}).add('default', {
  template: `<div fxLayout="column" fxLayoutGap="16px">
<rxap-checkbox-control label="default checkbox control" #control="rxapCheckboxControl"></rxap-checkbox-control>
<rxap-control-view [control]="control.control"></rxap-control-view>
</div>`
});
