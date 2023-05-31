import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Inject
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { SelectRowService } from '../select-row.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector:        'td[rxap-checkbox-cell]',
  templateUrl:     './checkbox-cell.component.html',
  styleUrls:       [ './checkbox-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.Default,
  host:            { class: 'rxap-checkbox-cell' },
  standalone:      true,
  imports:         [ MatCheckboxModule ]
})
export class CheckboxCellComponent<Data extends Record<string, any>> {

  @Input()
  @Required
  public element!: Data;

  constructor(
    @Inject(SelectRowService)
    public readonly selectRow: SelectRowService<Data>
  ) {}

}
