import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { throwIfEmpty } from '@rxap/rxjs';

import { TableDemoTableComponent } from './table-demo-table/table-demo-table.component';


@Component({
  selector: 'rxap-table-demo-panel',
  templateUrl: './table-demo-panel.component.html',
  styleUrls: [ './table-demo-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TableDemoTableComponent,
  ],
})
export class TableDemoPanelComponent {

  public readonly parameters$: Observable<{ uuid: string }>;

  constructor(private readonly route: ActivatedRoute) {
    this.parameters$ = this.route.params.pipe(
      map(({ uuid }) => uuid),
      throwIfEmpty('Could not extract the uuid from route'),
      map((uuid) => ({ uuid })),
    );
  }


}
