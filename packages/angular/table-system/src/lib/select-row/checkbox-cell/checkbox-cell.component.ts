import {ChangeDetectionStrategy, Component, Inject, Input} from '@angular/core';
import {Required} from '@rxap/utilities';
import {SelectRowService} from '../select-row.service';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[rxap-checkbox-cell]',
  templateUrl: './checkbox-cell.component.html',
  styleUrls: ['./checkbox-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [MatCheckboxModule],
})
export class CheckboxCellComponent<Data extends Record<string, any>> {

  @Input()
  @Required
  public element!: Data;

  constructor(
    @Inject(SelectRowService)
    public readonly selectRow: SelectRowService<Data>,
  ) {
  }

}
