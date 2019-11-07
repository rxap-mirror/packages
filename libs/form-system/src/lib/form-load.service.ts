import { Injectable } from '@angular/core';
import { FormInstance } from './form-instance';

@Injectable({ providedIn: 'root' })
export class FormLoadService<FormValue extends object> {

  public onLoad(instance: FormInstance<FormValue>): Promise<any> {
    return Promise.resolve();
  }

}
