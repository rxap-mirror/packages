import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  input
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { SelectRowService } from '../select-row.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-checkbox-cell]',
    templateUrl: './checkbox-cell.component.html',
    styleUrls: ['./checkbox-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [MatCheckboxModule]
})
export class CheckboxCellComponent<Data extends Record<string, any>> {

  public readonly element = input.required<Data>();

  constructor(
    @Inject(SelectRowService)
    public readonly selectRow: SelectRowService<Data>,
  ) {
  }

}
