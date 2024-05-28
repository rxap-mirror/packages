import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable } from '@angular/core';
import { Complex } from './complex';
import { ComplexMethod } from './complex.method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('complex')
export class ComplexDataSource extends AccordionDataSource<Complex> {
  constructor(method: ComplexMethod, route: ActivatedRoute) {
    super(method, route);
  }
}
