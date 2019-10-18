import {
  Injectable,
  Injector
} from '@angular/core';
import { BaseFormArray } from '../forms/form-arrays/base.form-array';
import { FormArrayMetaData } from '../form-definition/decorators/array';

@Injectable({ providedIn: 'root' })
export class FormArrayBuilder {

  constructor(public readonly injector: Injector) {}

  public getArrays(arrays: FormArrayMetaData[], injector = this.injector): { [propertyKey: string]: BaseFormArray<any> } {
    return {};
  }

}
