import { NgModule } from '@angular/core';
import { UserRegisterFormComponent } from './user-register-form.component';
import {
  RxapFormSystemModule,
  RxapFormCardComponentModule,
  RxapFormControlComponentModule
} from '@rxap/form-system';
import { UserRegisterFormDefinition } from './user-register-form.definition';
import { ChildrenFormDefinition } from './children-form.definition';


@NgModule({
  declarations: [UserRegisterFormComponent],
  imports: [
    RxapFormSystemModule.register([ UserRegisterFormDefinition, ChildrenFormDefinition ]),
    RxapFormCardComponentModule,
    RxapFormControlComponentModule
  ],
  exports: [UserRegisterFormComponent]
})
export class UserRegisterFormModule { }
