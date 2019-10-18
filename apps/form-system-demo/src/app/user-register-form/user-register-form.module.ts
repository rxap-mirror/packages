import { NgModule } from '@angular/core';
import { UserRegisterFormComponent } from './user-register-form.component';
import {
  RxapFormViewComponentModule,
  RxapFormSystemModule,
  FormCardComponentModule
} from '@rxap/form-system';
import { UserRegisterFormDefinition } from './user-register-form.definition';


@NgModule({
  declarations: [UserRegisterFormComponent],
  imports: [
    RxapFormSystemModule.register([ UserRegisterFormDefinition ]),
    FormCardComponentModule
  ],
  exports: [UserRegisterFormComponent]
})
export class UserRegisterFormModule { }
