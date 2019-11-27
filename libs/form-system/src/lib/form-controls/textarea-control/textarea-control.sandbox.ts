import { sandboxOf } from 'angular-playground';
import { RxapControlViewComponentModule } from '@rxap/form-system-dev';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapTextareaControlComponentModule } from './textarea-control.component.module';
import { RxapTextareaControlComponent } from './textarea-control.component';

export default sandboxOf(RxapTextareaControlComponent, {
  imports:          [
    RxapTextareaControlComponentModule.standalone(),
    RxapControlViewComponentModule,
    FlexLayoutModule
  ],
  declareComponent: false
}).add('default', {
  template: `<div fxLayout="column" fxLayoutGap="16px">
<rxap-textarea-control label="default textarea control" #control="rxapTextareaControl"></rxap-textarea-control>
<rxap-control-view [control]="control.control"></rxap-control-view>
</div>`
});
