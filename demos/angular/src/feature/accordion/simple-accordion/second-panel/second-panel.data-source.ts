import { RxapDataSource } from '@rxap/data-source';
import {
  Inject,
  Injectable,
} from '@angular/core';
import { SecondPanel } from './second-panel';
import { SecondPanelMethod } from './second-panel.method';
import {
  ACCORDION_DATA_SOURCE,
  AccordionDataSource,
  PanelAccordionDataSource,
} from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('second-panel')
export class SecondPanelDataSource extends PanelAccordionDataSource<SecondPanel> {
  constructor(
    method: SecondPanelMethod,
    route: ActivatedRoute,
    @Inject(ACCORDION_DATA_SOURCE) accordionDataSource: AccordionDataSource,
  ) {
    super(method, route, accordionDataSource);
  }
}
