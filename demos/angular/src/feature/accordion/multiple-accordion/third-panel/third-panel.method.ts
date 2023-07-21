import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { ThirdPanel } from './third-panel';

@Injectable()
export class ThirdPanelMethod implements Method {
  call(parameters?: any): ThirdPanel {
    console.log('parameters: ', parameters);
    return {
      uuid: faker.string.uuid(),
      name: faker.commerce.productName(),
    };
  }
}
