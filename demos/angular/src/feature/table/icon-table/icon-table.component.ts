import { CommonModule, AsyncPipe, NgIf, NgClass } from '@angular/common';
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
  RXAP_TABLE_METHOD,
  TableColumnMenuComponent,
  TableColumnOptionComponent,
  TableDataSourceDirective,
  TableHeaderButtonDirective,
  TableShowArchivedSlideComponent,
} from '@rxap/material-table-system';
import { GetFromObjectPipe } from '@rxap/pipes';
import { Observable } from 'rxjs';
import { DummyTableMethod } from '../dummy-table.method';

@Component({
  selector: 'rxap-icon-table',
  templateUrl: './icon-table.component.html',
  styleUrls: ['./icon-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [RowAnimation],
  standalone: true,
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
    TableHeaderButtonDirective,
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
    NgIf,
    NgClass,
  ],
  providers: [
    {
      provide: RXAP_TABLE_METHOD,
      useClass: DummyTableMethod,
    },
  ],
})
export class IconTableComponent {
  public readonly parameters = input<Observable<Record<string, unknown>>>();
}

export default IconTableComponent;
