import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule, AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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

import { DataSourceErrorComponent } from '@rxap/data-source';
import { TreeTableDataSource } from '@rxap/data-source/table/tree';
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
  TABLE_CREATE_REMOTE_METHOD,
  TABLE_DATA_SOURCE,
  TableColumnMenuComponent,
  TableColumnOptionComponent,
  TableCreateButtonDirective,
  TableDataSourceDirective,
  TableRowActionDirective,
  TableRowActionExecutingDirective,
  RowActionCheckPipe,
  TableShowArchivedSlideComponent,
  TreeControlCellComponent,
  TableHeaderButtonDirective,
  TABLE_HEADER_BUTTON_METHOD,
} from '@rxap/material-table-system';
import { GetFromObjectPipe } from '@rxap/pipes';
import { Observable } from 'rxjs';
import { TABLE_ROW_ACTION_METHODS } from './methods/action';
import { TableHeaderButtonMethod } from './methods/table-header-button.method';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderButtonMethod } from './methods/header-button.method';
import { OpenMaximumTreeFormWindowMethod } from './maximum-tree-form/open-maximum-tree-form-window.method';

@Component({
    selector: 'rxap-maximum-tree-table',
    templateUrl: './maximum-tree-table.component.html',
    styleUrls: ['./maximum-tree-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [RowAnimation],
    imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    CardProgressBarDirective,
    MatTableModule,
    TableDataSourceDirective,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterModule,
    MatDividerModule,
    TableColumnMenuComponent,
    TableColumnOptionComponent,
    DateCellComponent,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    InputClearButtonDirective,
    TableCreateButtonDirective,
    TableShowArchivedSlideComponent,
    PersistentPaginatorDirective,
    TableRowActionDirective,
    TableRowActionExecutingDirective,
    RowActionCheckPipe,
    MatTooltipModule,
    GetFromObjectPipe,
    CopyToClipboardCellComponent,
    LinkCellComponent,
    IconCellComponent,
    BooleanCellComponent,
    DataSourceErrorComponent,
    MatSnackBarModule,
    TreeControlCellComponent,
    AsyncPipe,
    NgClass,
    MatProgressSpinnerModule,
    TableHeaderButtonDirective
],
    providers: [
        {
            provide: TABLE_DATA_SOURCE,
            useClass: TreeTableDataSource,
        },
        TABLE_ROW_ACTION_METHODS,
        {
            provide: TABLE_CREATE_REMOTE_METHOD,
            useClass: TableHeaderButtonMethod,
        },
        {
            provide: TABLE_HEADER_BUTTON_METHOD,
            useClass: HeaderButtonMethod,
        },
        OpenMaximumTreeFormWindowMethod,
    ]
})
export class MaximumTreeTableComponent {
  public readonly parameters = input<Observable<Record<string, unknown>>>();
}

export default MaximumTreeTableComponent;
