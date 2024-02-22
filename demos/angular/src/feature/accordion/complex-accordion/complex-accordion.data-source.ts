import { RxapDataSource } from '@rxap/data-source';
import {
  inject,
  Injectable,
} from '@angular/core';
import { SecondPanelMethod } from '../multiple-accordion/second-panel/second-panel.method';
import { ComplexAccordion } from './complex-accordion';
import { ComplexAccordionMethod } from './complex-accordion.method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('complex-accordion')
export class ComplexAccordionDataSource extends AccordionDataSource<ComplexAccordion> {
  public override getParameters(): unknown {
      throw new Error('Method not implemented.');
  }

  protected override readonly method = inject(ComplexAccordionMethod);
}
