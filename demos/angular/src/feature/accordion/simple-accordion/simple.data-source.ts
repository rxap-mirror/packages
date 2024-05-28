import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable } from '@angular/core';
import { Simple } from './simple';
import { SimpleMethod } from './simple.method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('simple')
export class SimpleDataSource extends AccordionDataSource<Simple> {
  constructor(method: SimpleMethod, route: ActivatedRoute) {
    super(method, route);
  }
}
