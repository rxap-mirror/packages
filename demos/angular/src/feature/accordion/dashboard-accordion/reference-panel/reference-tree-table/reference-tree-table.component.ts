import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  INJECTOR,
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { DataSourceErrorComponent } from '@rxap/data-source';
import {
  RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD,
  RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD,
  TreeTableDataSource,
} from '@rxap/data-source/table/tree';
import { OptionsFromMethodDirective } from '@rxap/form-system';
import { ParentControlContainerDirective } from '@rxap/forms';
import { CardProgressBarDirective } from '@rxap/material-directives/card';
import { InputClearButtonDirective } from '@rxap/material-form-system';
import {
  PersistentPaginatorDirective,
  RowAnimation,
  RXAP_TABLE_FILTER_FORM_DEFINITION,
  TABLE_DATA_SOURCE,
  TableColumnMenuModule,
  TableDataSourceDirective,
  TableFilterModule,
  TableFilterService,
  TreeControlCellComponent,
} from '@rxap/material-table-system';
import { Observable } from 'rxjs';
import {
  FormFactory,
  FormProviders,
} from './form.providers';
import { IsReferencedCellComponent } from './is-referenced-cell/is-referenced-cell.component';
import { ScopeTypeCellComponent } from './scope-type-cell/scope-type-cell.component';
import { TreeTableChildrenProxyMethod } from './tree-table-children-proxy.method';
import { TreeTableRootProxyMethod } from './tree-table-root-proxy.method';

@Component({
  standalone: true,
  selector: 'rxap-reference-tree-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reference-tree-table.component.html',
  styleUrls: [ './reference-tree-table.component.scss' ],
  animations: [ RowAnimation ],
  imports: [
    TableColumnMenuModule, MatPaginatorModule, MatSortModule, PersistentPaginatorDirective, DataSourceErrorComponent,
    MatDividerModule, TableDataSourceDirective, MatTableModule, CardProgressBarDirective, MatProgressBarModule,
    MatCardModule, AsyncPipe, NgClass, TreeControlCellComponent, IsReferencedCellComponent, MatCheckboxModule,
    ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, InputClearButtonDirective,
    ParentControlContainerDirective, ScopeTypeCellComponent, MatSelectModule, OptionsFromMethodDirective,
    MatProgressSpinnerModule, NgIf, TableFilterModule,
  ],
  providers: [
    {
      provide: TABLE_DATA_SOURCE,
      useClass: TreeTableDataSource,
    },
    FormProviders,
    TableFilterService,
    {
      provide: RXAP_TABLE_FILTER_FORM_DEFINITION,
      useFactory: FormFactory,
      deps: [ INJECTOR ],
    },
    {
      provide: RXAP_TREE_TABLE_DATA_SOURCE_ROOT_METHOD,
      useClass: TreeTableRootProxyMethod,
    },
    {
      provide: RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_METHOD,
      useClass: TreeTableChildrenProxyMethod,
    },
  ],
})
export class ReferenceTreeTableComponent {
  @Input()
  public parameters?: Observable<Record<string, unknown>>;
}
