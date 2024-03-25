import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  Optional,
} from '@angular/core';
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
  styleUrls: [ './table-show-archived-slide.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ StopPropagationDirective, MatSlideToggleModule ],
})
export class TableShowArchivedSlideComponent implements AfterViewInit {

  @Input()
  public paginator?: MatPaginator;

  constructor(
    @Optional()
    @Inject(TableFilterService)
    private readonly tableFilter: TableFilterService | null,
    @Inject(TableColumnMenuComponent)
    private readonly tableColumnMenu: TableColumnMenuComponent,
    @Inject(SelectRowService)
    private readonly selectRows: SelectRowService | null,
  ) {
  }

  public onChange($event: MatSlideToggleChange) {
    this.paginator?.firstPage();
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

  public ngAfterViewInit() {
    this.tableColumnMenu.deactivate('removedAt');
    this.tableColumnMenu.deactivate('__removedAt');
    this.tableColumnMenu.deactivate('__--removed-at');
    this.tableColumnMenu.deactivate('removed-at');
    this.tableColumnMenu.deactivate('__removed-at');
  }

}
