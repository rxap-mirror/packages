import { RxapDataSource } from '@rxap/data-source';
import {
  Inject,
  Injectable,
} from '@angular/core';
import { FirstPanel } from './first-panel';
import { FirstPanelMethod } from './first-panel.method';
import {
  ACCORDION_DATA_SOURCE,
  AccordionDataSource,
  PanelAccordionDataSource,
} from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('first-panel')
export class FirstPanelDataSource extends PanelAccordionDataSource<FirstPanel> {
  constructor(
    method: FirstPanelMethod,
    route: ActivatedRoute,
    @Inject(ACCORDION_DATA_SOURCE) accordionDataSource: AccordionDataSource,
  ) {
    super(method, route, accordionDataSource);
  }
}
