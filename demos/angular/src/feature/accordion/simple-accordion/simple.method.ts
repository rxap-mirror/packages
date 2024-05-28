import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { Simple } from './simple';

@Injectable()
export class SimpleMethod implements Method {
  call(parameters?: any): Simple {
    console.log('parameters: ', parameters);
    return {} as any;
  }
}
