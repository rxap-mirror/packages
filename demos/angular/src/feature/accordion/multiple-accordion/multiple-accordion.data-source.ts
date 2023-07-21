import { RxapDataSource } from '@rxap/data-source';
import { Injectable } from '@angular/core';
import { MultipleAccordion } from './multiple-accordion';
import { MultipleAccordionMethod } from './multiple-accordion.method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('multiple-accordion')
export class MultipleAccordionDataSource extends AccordionDataSource<MultipleAccordion> {
  constructor(method: MultipleAccordionMethod, route: ActivatedRoute) {
    super(method, route);
  }
}
