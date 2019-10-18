import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainerComponent } from './control-container/control-container.component';
import { LayoutComponent } from './layout/layout.component';
import { StepperComponent } from './stepper/stepper.component';
import { MatStepperModule } from '@angular/material/stepper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormViewComponent } from './form-view.component';


@NgModule({
  declarations: [
    ControlContainerComponent,
    LayoutComponent,
    StepperComponent,
    FormViewComponent,
  ],
  exports: [
    ControlContainerComponent,
    LayoutComponent,
    StepperComponent,
    FormViewComponent,
  ],
  entryComponents: [
    ControlContainerComponent,
    LayoutComponent,
    StepperComponent,
    FormViewComponent,
  ],
  imports: [
    CommonModule,
    MatStepperModule,
    FlexLayoutModule,
  ]
})
export class RxapFormViewComponentModule { }
