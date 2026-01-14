import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {
  RowAnimation,
  TableColumnMenuModule,
  PersistentPaginatorDirective,
  TableDataSourceDirective,
  TABLE_REMOTE_METHOD_ADAPTER_FACTORY,
  RXAP_TABLE_METHOD,
} from '@rxap/material-table-system';
import { Observable } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { CardProgressBarDirective } from '@rxap/material-directives/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe, NgIf, NgClass } from '@angular/common';
import { GetPageAdapterFactory } from '@rxap/open-api/remote-method';
import { TestTableControllerGetPageRemoteMethod } from 'open-api-service-nest/src/lib/remote-methods';

@Component({
  standalone: true,
  selector: 'rxap-test-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './test-table.component.html',
  styleUrls: ['./test-table.component.scss'],
  animations: [RowAnimation],
  imports: [
    TableColumnMenuModule,
    MatPaginatorModule,
    PersistentPaginatorDirective,
    DataSourceErrorComponent,
    MatDividerModule,
    TableDataSourceDirective,
    MatTableModule,
    CardProgressBarDirective,
    MatProgressBarModule,
    MatCardModule,
    AsyncPipe,
    NgIf,
    NgClass,
  ],
  providers: [
    {
      provide: TABLE_REMOTE_METHOD_ADAPTER_FACTORY,
      useValue: GetPageAdapterFactory,
    },
    {
      provide: RXAP_TABLE_METHOD,
      useExisting: TestTableControllerGetPageRemoteMethod,
    },
  ],
})
export class TestTableComponent {
  @Input()
  public parameters?: Observable<Record<string, unknown>>;
}

export default TestTableComponent;
