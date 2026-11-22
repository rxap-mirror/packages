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
  RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
  RXAP_TABLE_METHOD,
  CheckboxCellComponent,
  CheckboxHeaderCellComponent,
  SelectedRowsDirective,
  SelectRowService,
  TableColumnMenuComponent,
  TableColumnOptionComponent,
  TableCreateButtonDirective,
  TableDataSourceDirective,
  TableRowActionDirective,
  TableRowHeaderActionDirective,
  TableRowActionExecutingDirective,
  RowActionCheckPipe,
  TableShowArchivedSlideComponent,
} from '@rxap/material-table-system';
import { GetFromObjectPipe } from '@rxap/pipes';
import { Observable } from 'rxjs';
import { DummyTableMethod } from '../dummy-table.method';
import { TABLE_ROW_ACTION_METHODS } from './methods/action';

@Component({
    selector: 'rxap-action-table',
    templateUrl: './action-table.component.html',
    styleUrls: ['./action-table.component.scss'],
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
    TableRowHeaderActionDirective,
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
    CheckboxCellComponent,
    CheckboxHeaderCellComponent,
    SelectedRowsDirective,
    AsyncPipe,
    NgClass
],
    providers: [
        {
            provide: RXAP_TABLE_METHOD,
            useClass: DummyTableMethod,
        },
        TABLE_ROW_ACTION_METHODS,
        SelectRowService,
        {
            provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
            useValue: {
                multiple: true,
            },
        },
    ]
})
export class ActionTableComponent {
  public readonly parameters = input<Observable<Record<string, unknown>>>();
}

export default ActionTableComponent;
