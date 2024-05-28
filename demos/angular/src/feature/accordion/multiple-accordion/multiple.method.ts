import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { Multiple } from './multiple';

@Injectable()
export class MultipleMethod implements Method {
  call(parameters?: any): Multiple {
    console.log('parameters: ', parameters);
    return {} as any;
  }
}
