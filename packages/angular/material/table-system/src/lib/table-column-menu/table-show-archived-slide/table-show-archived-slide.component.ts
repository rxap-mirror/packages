import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  Optional,
} from '@angular/core';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { TableFilterService } from '../../table-filter/table-filter.service';
import { TableColumnMenuComponent } from '../table-column-menu.component';
import { StopPropagationDirective } from '@rxap/directives';
import { MatPaginator } from '@angular/material/paginator';

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
  ) {
  }

  public onChange($event: MatSlideToggleChange) {
    this.paginator?.firstPage();
    this.tableFilter?.set('__archived', $event.checked);
    if ($event.checked) {
      this.tableColumnMenu.activate('removedAt');
    } else {
      this.tableColumnMenu.deactivate('removedAt');
    }
  }

  public ngAfterViewInit() {
    this.tableColumnMenu.deactivate('removedAt');
  }

}
