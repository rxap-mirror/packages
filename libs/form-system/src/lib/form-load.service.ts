import { Injectable } from '@angular/core';
import { FormInstance } from './form-instance';
import {
  Observable,
  EMPTY
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FormLoadService<FormValue extends object> {

  public onLoad(instance: FormInstance<FormValue>): Observable<any> | Promise<any> {
    return EMPTY;
  }

}
