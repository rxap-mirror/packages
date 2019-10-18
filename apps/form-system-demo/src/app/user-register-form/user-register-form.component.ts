import { Component } from '@angular/core';
import { RXAP_FORM_ID } from '@rxap/form-system';
import { USER_REGISTER_FORM } from './user-register-form.definition';

@Component({
  selector: 'rxap-user-register-form',
  templateUrl: './user-register-form.component.html',
  styleUrls: ['./user-register-form.component.scss'],
  providers: [
    {
      provide: RXAP_FORM_ID,
      useValue: USER_REGISTER_FORM,
    }
  ]
})
export class UserRegisterFormComponent {}
