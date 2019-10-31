import { Injectable } from '@angular/core';
import { FormInstance } from './form-instance';

@Injectable({ providedIn: 'root' })
export class FormInvalidSubmitService<FormValue extends object> {

  public onInvalidSubmit(instance: FormInstance<FormValue>): void {}

}
