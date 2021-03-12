import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TableFilterService } from '../table-filter/table-filter.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TableColumnMenuComponent } from '../table-column-menu/table-column-menu.component';

@Component({
  selector: 'mfd-table-show-archived-slide',
  templateUrl: './table-show-archived-slide.component.html',
  styleUrls: ['./table-show-archived-slide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {class: 'mfd-table-show-archived-slide'},
})
export class TableShowArchivedSlideComponent {

  constructor(
    private readonly tableFilter: TableFilterService,
    private readonly tableColumnMenu: TableColumnMenuComponent,
  ) {}

  public onChange($event: MatSlideToggleChange) {
    this.tableFilter.set('__archived', $event.checked);
    if ($event.checked) {
      this.tableColumnMenu.activate('removedAt');
    } else {
      this.tableColumnMenu.deactivate('removedAt');
    }
  }

}
