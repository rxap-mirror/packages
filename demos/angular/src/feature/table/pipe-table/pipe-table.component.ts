import {
  CommonModule,
  JsonPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { HasPermissionModule } from '@rxap/authorization';

import { ConfirmModule } from '@rxap/components';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { RxapFormsModule } from '@rxap/forms';
import { CardProgressBarDirective } from '@rxap/material-directives/card';
import { InputClearButtonDirective } from '@rxap/material-form-system';
import {
  BooleanCellComponent,
  CopyToClipboardCellComponent,
  DateCellComponent,
  IconCellComponent,
  LinkCellComponent,
  PersistentPaginatorDirective,
  RowAnimation,
  RXAP_TABLE_METHOD,
  TableColumnMenuModule,
  TableDataSourceDirective,
  TableFilterModule,
  TableHeaderButtonDirective,
  TableRowActionsModule,
  TableShowArchivedSlideComponent,
} from '@rxap/material-table-system';
import { GetFromObjectPipe } from '@rxap/pipes';
import { Observable } from 'rxjs';
import { DummyTableMethod } from '../dummy-table.method';


import { ToUppercasePipe } from './to-uppercase.pipe';

@Component({
  selector: 'rxap-pipe-table',
  templateUrl: './pipe-table.component.html',
  styleUrls: [ './pipe-table.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ RowAnimation ],
  standalone: true,
  imports: [


    ToUppercasePipe,

    JsonPipe,


    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    CardProgressBarDirective,
    MatTableModule,
    TableDataSourceDirective,
    TableFilterModule,
    RxapFormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterModule,
    MatDividerModule,

    TableColumnMenuModule,
    DateCellComponent,

    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    InputClearButtonDirective,
    TableHeaderButtonDirective,
    TableShowArchivedSlideComponent,
    PersistentPaginatorDirective,
    ConfirmModule,
    HasPermissionModule,
    TableRowActionsModule,
    GetFromObjectPipe,
    CopyToClipboardCellComponent,
    LinkCellComponent,
    IconCellComponent,
    BooleanCellComponent,
    DataSourceErrorComponent,
    MatSnackBarModule,
  ],
  providers: [
    {
      provide: RXAP_TABLE_METHOD,
      useClass: DummyTableMethod,
    },
  ],
})
export class PipeTableComponent {

  @Input()
  public parameters?: Observable<Record<string, unknown>>;

}


