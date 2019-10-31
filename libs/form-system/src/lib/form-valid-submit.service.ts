import { Injectable } from '@angular/core';
import { FormInstance } from './form-instance';

@Injectable({ providedIn: 'root' })
export class FormValidSubmitService<FormValue extends object> {

  public onValidSubmit(instance: FormInstance<FormValue>): void {}

}
