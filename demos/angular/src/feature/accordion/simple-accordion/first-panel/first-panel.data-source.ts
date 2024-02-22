import { RxapDataSource } from '@rxap/data-source';
import {
  inject,
  Inject,
  Injectable,
} from '@angular/core';
import { SecondPanelMethod } from '../../multiple-accordion/second-panel/second-panel.method';
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

  protected override readonly method = inject(FirstPanelMethod);

}
