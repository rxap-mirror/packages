import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { SecondPanel } from './second-panel';

@Injectable()
export class SecondPanelMethod implements Method {
  call(parameters?: any): SecondPanel {
    console.log('parameters: ', parameters);
    return {
      uuid: faker.string.uuid(),
      name: faker.commerce.productName(),
    };
  }
}
