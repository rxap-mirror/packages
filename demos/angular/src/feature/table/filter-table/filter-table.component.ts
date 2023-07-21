import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  INJECTOR,
  Injector,
  Inject,
} from '@angular/core';
import {
  Observable,
  from,
} from 'rxjs';
import {
  RowAnimation,
  TableShowArchivedSlideComponent,
  RXAP_TABLE_METHOD,
  TableFilterService,
  RXAP_TABLE_FILTER_FORM_DEFINITION,
} from '@rxap/material-table-system';
import { GetFromObjectPipe } from '@rxap/pipes';
import {
  BooleanCellComponent,
  CopyToClipboardCellComponent,
  DateCellComponent,
  IconCellComponent,
  LinkCellComponent,
  PersistentPaginatorDirective,
  TableColumnMenuModule,
  TableCreateButtonDirective,
  TableDataSourceDirective,
  TableFilterModule,
  TableRowActionsModule,
  TableRowControlsModule,
} from '@rxap/material-table-system';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CardProgressBarDirective } from '@rxap/material-directives/card';
import { MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapFormsModule } from '@rxap/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';

import { ConfirmModule } from '@rxap/components';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InputClearButtonDirective } from '@rxap/material-form-system';
import { HasPermissionModule } from '@rxap/authorization';
import { CommonModule } from '@angular/common';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DummyTableMethod } from '../dummy-table.method';
import {
  FormProviders,
  FormFactory,
} from './form.providers';

@Component({
  selector: 'rxap-filter-table',
  templateUrl: './filter-table.component.html',
  styleUrls: [ './filter-table.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ RowAnimation ],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    CardProgressBarDirective,
    MatTableModule,
    FlexLayoutModule,
    TableDataSourceDirective,
    TableFilterModule,
    RxapFormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterModule,
    MatDividerModule,

    TableRowControlsModule,
    TableColumnMenuModule,
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
    FormProviders,
    TableFilterService,
    {
      provide: RXAP_TABLE_FILTER_FORM_DEFINITION,
      useFactory: FormFactory,
      deps: [ INJECTOR ],
    },
  ],
})
export class FilterTableComponent {

  @Input()
  public parameters?: Observable<Record<string, unknown>>;

}

export default FilterTableComponent;
