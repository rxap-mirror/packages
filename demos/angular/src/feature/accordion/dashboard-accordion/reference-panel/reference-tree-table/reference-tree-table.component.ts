import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
import { RowAnimation,
TableShowArchivedSlideComponent,
TreeControlCellComponent,
TABLE_DATA_SOURCE,
} from '@rxap/material-table-system';
import { GetFromObjectPipe } from '@rxap/pipes';
import {
  BooleanCellComponent,
  CopyToClipboardCellComponent, DateCellComponent,
  IconCellComponent,
  LinkCellComponent, PersistentPaginatorDirective,
  TableColumnMenuModule, TableCreateButtonDirective,
  TableDataSourceDirective,
  TableFilterModule, TableRowActionsModule,
} from '@rxap/material-table-system';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CardProgressBarDirective } from '@rxap/material-directives/card';
import { MatTableModule } from '@angular/material/table';
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
import { TreeTableDataSource, RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD, RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD } from '@rxap/data-source/table/tree';
import { TreeTableRootProxyMethod } from './tree-table-root-proxy.method';
import { TreeTableChildrenProxyMethod } from './tree-table-children-proxy.method';

@Component({
  selector:        'rxap-reference-table',
  templateUrl:     './reference-table.component.html',
  styleUrls:       [ './reference-table.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ RowAnimation ],
  standalone: true,
  imports: [
    
    
    
    
    
    
    
    
    
    
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
    TreeControlCellComponent,
  ],
  providers: [{
      provide: TABLE_DATA_SOURCE,
      useClass: TreeTableDataSource
    },
    {
      provide: RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD,
      useClass: TreeTableRootProxyMethod
    },
    {
      provide: RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD,
      useClass: TreeTableChildrenProxyMethod
    },
  ],
})
export class ReferenceTreeTableComponent {

  @Input()
  public parameters?: Observable<Record<string, unknown>>;

}


