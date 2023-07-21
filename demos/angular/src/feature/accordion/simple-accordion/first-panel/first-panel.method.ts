import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { FirstPanel } from './first-panel';

@Injectable()
export class FirstPanelMethod implements Method {
  call(parameters?: any): FirstPanel {
    console.log('parameters: ', parameters);
    return {
      uuid: faker.string.uuid(),
      name: faker.commerce.productName(),
    };
  }
}
