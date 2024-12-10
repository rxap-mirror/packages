import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { throwIfEmpty } from '@rxap/rxjs';

import { TableDemoTableComponent } from './table-demo-table/table-demo-table.component';
import { DataSourceDirective } from '@rxap/data-source/directive';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataSourceErrorComponent } from '@rxap/data-source';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { TableDemoPanelDataSource } from './table-demo-panel.data-source';
import { TableDemoPanelMethod } from './table-demo-panel.method';

@Component({
    selector: 'rxap-table-demo-panel',
    templateUrl: './table-demo-panel.component.html',
    styleUrls: ['./table-demo-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TableDemoTableComponent,
        DataSourceDirective,
        MatProgressBarModule,
        DataSourceErrorComponent,
        AsyncPipe,
        JsonPipe,
    ],
    providers: [TableDemoPanelDataSource, TableDemoPanelMethod]
})
export class TableDemoPanelComponent {
  public readonly parameters$: Observable<{ uuid: string }>;

  constructor(private readonly route: ActivatedRoute) {
    this.parameters$ = this.route.params.pipe(
      map(({ uuid }) => uuid),
      throwIfEmpty('Could not extract the uuid from route'),
      map((uuid) => ({ uuid }))
    );
  }

  public readonly panelDataSource = inject(TableDemoPanelDataSource);
}
