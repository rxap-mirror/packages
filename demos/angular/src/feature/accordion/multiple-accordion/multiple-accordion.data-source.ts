import { RxapDataSource } from '@rxap/data-source';
import {
  inject,
  Injectable,
} from '@angular/core';
import { MultipleAccordion } from './multiple-accordion';
import { MultipleAccordionMethod } from './multiple-accordion.method';
import { AccordionDataSource } from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';
import { SecondPanelMethod } from './second-panel/second-panel.method';

@Injectable()
@RxapDataSource('multiple-accordion')
export class MultipleAccordionDataSource extends AccordionDataSource<MultipleAccordion> {
  public override getParameters(): unknown {
      throw new Error('Method not implemented.');
  }

  protected override readonly method = inject(MultipleAccordionMethod);

}

