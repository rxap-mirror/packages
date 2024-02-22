import { RxapDataSource } from '@rxap/data-source';
import {
  inject,
  Inject,
  Injectable,
} from '@angular/core';
import { SecondPanelMethod } from '../second-panel/second-panel.method';
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

  protected override readonly method = inject(ThirdPanelMethod);

}
