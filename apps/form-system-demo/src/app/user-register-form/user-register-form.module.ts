import { NgModule } from '@angular/core';
import { UserRegisterFormComponent } from './user-register-form.component';
import {
  RxapFormSystemModule,
  RxapFormCardComponentModule,
  RxapInputControlComponentModule,
  RxapSelectControlModule,
  RxapTextareaControlModule,
  RxapRadioButtonControlModule,
  RxapSelectListControlComponentModule,
  RxapSelectMultipleListControlComponentModule
} from '@rxap/form-system';
import { UserRegisterFormDefinition } from './user-register-form.definition';


@NgModule({
  declarations: [UserRegisterFormComponent],
  imports: [
    RxapFormSystemModule.register([ UserRegisterFormDefinition ]),
    RxapFormCardComponentModule,
    RxapInputControlComponentModule,
    RxapSelectControlModule,
    RxapTextareaControlModule,
    RxapRadioButtonControlModule,
    RxapSelectListControlComponentModule,
    RxapSelectMultipleListControlComponentModule
  ],
  exports: [UserRegisterFormComponent]
})
export class UserRegisterFormModule { }
