import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { SimpleAccordion } from './simple-accordion';

@Injectable()
export class SimpleAccordionMethod implements Method {
  call(parameters?: any): SimpleAccordion {
    console.log('parameters: ', parameters);
    return {
      uuid: faker.string.uuid(),
      name: faker.commerce.productName(),
    };
  }
}
