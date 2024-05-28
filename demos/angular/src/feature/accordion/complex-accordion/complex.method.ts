import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { Complex } from './complex';

@Injectable()
export class ComplexMethod implements Method {
  call(parameters?: any): Complex {
    console.log('parameters: ', parameters);
    return {} as any;
  }
}
