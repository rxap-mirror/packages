import { RxapDataSource } from '@rxap/data-source';
import {
  inject,
  Injectable,
} from '@angular/core';
import { SecondPanelMethod } from '../multiple-accordion/second-panel/second-panel.method';
import { SimpleAccordion } from './simple-accordion';
import { SimpleAccordionMethod } from './simple-accordion.method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('simple-accordion')
export class SimpleAccordionDataSource extends AccordionDataSource<SimpleAccordion> {
  public override getParameters(): unknown {
      throw new Error('Method not implemented.');
  }

  protected override readonly method = inject(SimpleAccordionMethod);

}
