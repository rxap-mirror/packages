import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { MultipleAccordion } from './multiple-accordion';

@Injectable()
export class MultipleAccordionMethod implements Method {
  call(parameters?: any): MultipleAccordion {
    console.log('parameters: ', parameters);
    return {
      uuid: faker.string.uuid(),
      name: faker.commerce.productName(),
    };
  }
}
