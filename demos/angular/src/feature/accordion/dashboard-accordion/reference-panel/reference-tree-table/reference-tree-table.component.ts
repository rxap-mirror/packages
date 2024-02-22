import { Component, ChangeDetectionStrategy, Input, INJECTOR } from '@angular/core';
import { RowAnimation, TableColumnMenuModule, PersistentPaginatorDirective, TableDataSourceDirective, TableFilterModule, TreeControlCellComponent, TABLE_DATA_SOURCE, TableFilterService, RXAP_TABLE_FILTER_FORM_DEFINITION } from '@rxap/material-table-system';
import { Observable } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { CardProgressBarDirective } from '@rxap/material-directives/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InputClearButtonDirective } from '@rxap/material-form-system';
import { ReactiveFormsModule } from '@angular/forms';
import { ParentControlContainerDirective } from '@rxap/forms';
import { TreeTableDataSource, RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD, RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD } from '@rxap/data-source/table/tree';
import { FormProviders, FormFactory } from './form.providers';
import { TreeTableRootProxyMethod } from './tree-table-root-proxy.method';
import { TreeTableChildrenProxyMethod } from './tree-table-children-proxy.method';

@Component({
    standalone: true,
    selector: 'rxap-reference-tree-table',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './reference-tree-table.component.html',
    styleUrls: ['./reference-tree-table.component.scss'],
  animations: [RowAnimation],
  imports: [TableColumnMenuModule, MatPaginatorModule, MatSortModule, PersistentPaginatorDirective, DataSourceErrorComponent, MatDividerModule, TableDataSourceDirective, MatTableModule, CardProgressBarDirective, MatProgressBarModule, MatCardModule, AsyncPipe, NgClass, MatInputModule, MatButtonModule, MatIconModule, InputClearButtonDirective, ReactiveFormsModule, ParentControlContainerDirective, TableFilterModule, TreeControlCellComponent],
  providers: [{
      provide: TABLE_DATA_SOURCE,
      useClass: TreeTableDataSource
    },
    FormProviders,
    TableFilterService,
    {
      provide: RXAP_TABLE_FILTER_FORM_DEFINITION,
      useFactory: FormFactory,
      deps: [ INJECTOR ]
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
