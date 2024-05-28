import { RxapDataSource, BaseDataSource } from '@rxap/data-source';
import { Injectable } from '@angular/core';
import { Multiple } from './multiple';
import { MultipleMethod } from './multiple.method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('multiple')
export class MultipleDataSource extends AccordionDataSource<Multiple> {
  constructor(method: MultipleMethod, route: ActivatedRoute) {
    super(method, route);
  }
}
