import { RxapDataSource } from '@rxap/data-source';
import {
  inject,
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


  protected override readonly method = inject(SecondPanelMethod);

}
