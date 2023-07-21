import { RxapDataSource } from '@rxap/data-source';
import { Injectable } from '@angular/core';
import { ComplexAccordion } from './complex-accordion';
import { ComplexAccordionMethod } from './complex-accordion.method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('complex-accordion')
export class ComplexAccordionDataSource extends AccordionDataSource<ComplexAccordion> {
  constructor(method: ComplexAccordionMethod, route: ActivatedRoute) {
    super(method, route);
  }
}
