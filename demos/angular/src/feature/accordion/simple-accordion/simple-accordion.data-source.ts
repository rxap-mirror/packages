import { RxapDataSource } from '@rxap/data-source';
import { Injectable } from '@angular/core';
import { SimpleAccordion } from './simple-accordion';
import { SimpleAccordionMethod } from './simple-accordion.method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('simple-accordion')
export class SimpleAccordionDataSource extends AccordionDataSource<SimpleAccordion> {
  constructor(method: SimpleAccordionMethod, route: ActivatedRoute) {
    super(method, route);
  }
}
