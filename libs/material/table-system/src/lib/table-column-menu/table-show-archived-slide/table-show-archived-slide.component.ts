import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  MatLegacySlideToggleChange as MatSlideToggleChange,
  MatLegacySlideToggleModule
} from '@angular/material/legacy-slide-toggle';
import { TableFilterService } from '../../table-filter/table-filter.service';
import { TableColumnMenuComponent } from '../table-column-menu.component';
import { StopPropagationDirective } from '@rxap/directives';

@Component({
  selector:        'mfd-table-show-archived-slide',
  templateUrl:     './table-show-archived-slide.component.html',
  styleUrls:       [ './table-show-archived-slide.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'mfd-table-show-archived-slide' },
  standalone:      true,
  imports:         [ StopPropagationDirective, MatLegacySlideToggleModule ]
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
