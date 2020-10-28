import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Inject
} from '@angular/core';
import { ExpandRowService } from '../expand-row.service';
import { Required } from '@rxap/utilities';

@Component({
  // tslint:disable-next-line:component-selector
  selector:        'td[rxap-expand-controls-cell]',
  templateUrl:     './expand-controls-cell.component.html',
  styleUrls:       [ './expand-controls-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-expand-controls-cell' }
})
export class ExpandControlsCellComponent<Data extends Record<string, any>> {

  @Input()
  @Required
  public element!: Data;

  constructor(
    @Inject(ExpandRowService)
    public readonly expandCell: ExpandRowService<Data>
  ) {}

}
