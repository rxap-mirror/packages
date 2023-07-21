import {
  AsyncPipe,
  KeyValuePipe,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
} from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ParentControlContainerDirective } from '@rxap/forms';
import { InputClearButtonDirective } from '@rxap/material-form-system';
import {
  BooleanCellComponent,
  CheckboxCellComponent,
  CheckboxHeaderCellComponent,
  DateCellComponent,
  FilterHeaderRowDirective,
  RowAnimation,
  SelectRowService,
  TableDataSourceDirective,
  TableFilterService,
} from '@rxap/material-table-system';
import { GetFromObjectPipe } from '@rxap/pipes';
import {
  RXAP_WINDOW_DATA,
  RXAP_WINDOW_REF,
  WindowFooterDirective,
  WindowRef,
} from '@rxap/window-system';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenTableSelectWindowMethodParameters } from '../open-table-select-window.method';


@Component({
  selector: 'rxap-table-select-window',
  templateUrl: './table-select-window.component.html',
  styleUrls: [ './table-select-window.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ RowAnimation ],
  providers: [ SelectRowService, TableFilterService ],
  standalone: true,
  imports: [
    NgIf,
    MatProgressBarModule,
    MatTableModule,
    TableDataSourceDirective,
    FilterHeaderRowDirective,
    MatSortModule,
    CheckboxHeaderCellComponent,
    CheckboxCellComponent,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    ParentControlContainerDirective,
    MatButtonModule,
    InputClearButtonDirective,
    MatIconModule,
    DateCellComponent,
    BooleanCellComponent,
    MatPaginatorModule,
    WindowFooterDirective,
    FlexModule,
    AsyncPipe,
    KeyValuePipe,
    GetFromObjectPipe,
  ],
})
export class TableSelectWindowComponent<Data = unknown> {

  public readonly displayColumns: string[];
  public readonly filterDisplayColumns: string[];
  public readonly hasSomeFilterColumn: boolean;
  public readonly id: string;

  public hasNotSelected$: Observable<boolean>;

  constructor(
    @Inject(RXAP_WINDOW_DATA)
    public readonly data: OpenTableSelectWindowMethodParameters,
    private readonly selectRows: SelectRowService<Data>,
    @Inject(RXAP_WINDOW_REF)
    private readonly windowRef: WindowRef,
  ) {
    this.id = this.data.id;
    this.displayColumns = [ ...this.data.columns.keys() ];
    if (this.data.multiple) {
      this.displayColumns.unshift('select');
    }
    this.filterDisplayColumns = this.displayColumns.map(column => [ 'filter', column ].join('__'));
    this.hasSomeFilterColumn = Array.from(this.data.columns.values()).some(column => column.filter);
    this.hasNotSelected$ = this.selectRows.selectedRows$.pipe(
      map((selected) => selected.length === 0),
    );
  }

  selectRow(element: Data) {
    this.selectRows.selectionModel.select(element);
    // if not multi select send the selection and close
    if (!this.data.multiple) {
      this.select();
    }
  }

  public close() {
    this.windowRef.complete();
  }

  public select() {
    this.windowRef.next(this.selectRows.selectedRows);
    this.close();
  }

}
