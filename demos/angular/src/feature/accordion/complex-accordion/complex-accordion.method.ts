import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { ComplexAccordion } from './complex-accordion';

@Injectable()
export class ComplexAccordionMethod implements Method {
  call(parameters?: any): ComplexAccordion {
    console.log('parameters: ', parameters);
    return {
      uuid: faker.string.uuid(),
      name: faker.commerce.productName(),
    };
  }
}
