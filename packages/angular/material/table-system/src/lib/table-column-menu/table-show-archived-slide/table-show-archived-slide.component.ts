import { afterNextRender, ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { StopPropagationDirective } from '@rxap/directives';
import { SelectRowService } from '../../select-row/select-row.service';
import { TableFilterService } from '../../table-filter/table-filter.service';
import { TableColumnMenuComponent } from '../table-column-menu.component';

@Component({
    selector: 'rxap-table-show-archived-slide',
    templateUrl: './table-show-archived-slide.component.html',
    styleUrls: ['./table-show-archived-slide.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [StopPropagationDirective, MatSlideToggleModule]
})
export class TableShowArchivedSlideComponent {
  private readonly tableFilter = inject<TableFilterService | null>(TableFilterService, { optional: true });
  private readonly tableColumnMenu = inject<TableColumnMenuComponent>(TableColumnMenuComponent);
  private readonly selectRows = inject<SelectRowService | null>(SelectRowService);


  public readonly paginator = input<MatPaginator>();

  public onChange($event: MatSlideToggleChange) {
    this.paginator()?.firstPage();
    this.tableFilter?.set('__archived', $event.checked);
    this.selectRows?.clear();
    if ($event.checked) {
      this.tableColumnMenu.activate('removedAt');
      this.tableColumnMenu.activate('__removedAt');
      this.tableColumnMenu.activate('__--removed-at');
      this.tableColumnMenu.activate('removed-at');
      this.tableColumnMenu.activate('__removed-at');
    } else {
      this.tableColumnMenu.deactivate('removedAt');
      this.tableColumnMenu.deactivate('__removedAt');
      this.tableColumnMenu.deactivate('__--removed-at');
      this.tableColumnMenu.deactivate('removed-at');
      this.tableColumnMenu.deactivate('__removed-at');
    }
  }

  constructor() {
    afterNextRender(() => {
      this.tableColumnMenu.deactivate('removedAt');
      this.tableColumnMenu.deactivate('__removedAt');
      this.tableColumnMenu.deactivate('__--removed-at');
      this.tableColumnMenu.deactivate('removed-at');
      this.tableColumnMenu.deactivate('__removed-at');
    });
  }

}
