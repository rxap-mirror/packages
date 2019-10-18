import { NgModule } from '@angular/core';
import { UserRegisterFormComponent } from './user-register-form.component';
import {
  RxapFormSystemModule,
  FormCardComponentModule,
  RxapInputControlComponentModule
} from '@rxap/form-system';
import { UserRegisterFormDefinition } from './user-register-form.definition';


@NgModule({
  declarations: [UserRegisterFormComponent],
  imports: [
    RxapFormSystemModule.register([ UserRegisterFormDefinition ]),
    FormCardComponentModule,
    RxapInputControlComponentModule
  ],
  exports: [UserRegisterFormComponent]
})
export class UserRegisterFormModule { }
