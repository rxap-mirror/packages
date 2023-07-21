import { RxapDataSource } from '@rxap/data-source';
import {
  Inject,
  Injectable,
} from '@angular/core';
import { ThirdPanel } from './third-panel';
import { ThirdPanelMethod } from './third-panel.method';
import {
  ACCORDION_DATA_SOURCE,
  AccordionDataSource,
  PanelAccordionDataSource,
} from '@rxap/data-source/accordion';
import { ActivatedRoute } from '@angular/router';

@Injectable()
@RxapDataSource('third-panel')
export class ThirdPanelDataSource extends PanelAccordionDataSource<ThirdPanel> {
  constructor(
    method: ThirdPanelMethod,
    route: ActivatedRoute,
    @Inject(ACCORDION_DATA_SOURCE) accordionDataSource: AccordionDataSource,
  ) {
    super(method, route, accordionDataSource);
  }
}
