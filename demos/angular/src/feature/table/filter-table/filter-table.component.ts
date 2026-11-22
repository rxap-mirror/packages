import { CommonModule, AsyncPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  INJECTOR,
  input,
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

import { DataSourceErrorComponent } from '@rxap/data-source';
import { ParentControlContainerDirective } from '@rxap/forms';
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
  RXAP_TABLE_FILTER_FORM_DEFINITION,
  RXAP_TABLE_METHOD,
  TableColumnMenuComponent,
  TableColumnOptionComponent,
  TableCreateButtonDirective,
  TableDataSourceDirective,
  FilterHeaderRowDirective,
  ToFilterColumnNamesPipe,
  TableFilterService,
  TableShowArchivedSlideComponent,
} from '@rxap/material-table-system';
import { GetFromObjectPipe } from '@rxap/pipes';
import { Observable } from 'rxjs';
import { DummyTableMethod } from '../dummy-table.method';
import { FormFactory, FormProviders } from './form.providers';
import { MatSelectModule } from '@angular/material/select';
import { InputSelectOptionsDirective } from '@rxap/form-system';

@Component({
    selector: 'rxap-filter-table',
    templateUrl: './filter-table.component.html',
    styleUrls: ['./filter-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [RowAnimation],
    imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    CardProgressBarDirective,
    MatTableModule,
    TableDataSourceDirective,
    FilterHeaderRowDirective,
    ToFilterColumnNamesPipe,
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
    GetFromObjectPipe,
    CopyToClipboardCellComponent,
    LinkCellComponent,
    IconCellComponent,
    BooleanCellComponent,
    DataSourceErrorComponent,
    MatSnackBarModule,
    AsyncPipe,
    NgClass,
    ParentControlContainerDirective,
    MatSelectModule,
    InputSelectOptionsDirective
],
    providers: [
        {
            provide: RXAP_TABLE_METHOD,
            useClass: DummyTableMethod,
        },
        FormProviders,
        TableFilterService,
        {
            provide: RXAP_TABLE_FILTER_FORM_DEFINITION,
            useFactory: FormFactory,
            deps: [INJECTOR],
        },
    ]
})
export class FilterTableComponent {
  public readonly parameters = input<Observable<Record<string, unknown>>>();
}

export default FilterTableComponent;
