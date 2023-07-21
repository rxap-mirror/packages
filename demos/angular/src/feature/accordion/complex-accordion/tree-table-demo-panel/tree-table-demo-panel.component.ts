import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { throwIfEmpty } from '@rxap/rxjs';

import { TreeTableDemoTableComponent } from './tree-table-demo-table/tree-table-demo-table.component';


@Component({
  selector: 'rxap-tree-table-demo-panel',
  templateUrl: './tree-table-demo-panel.component.html',
  styleUrls: [ './tree-table-demo-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TreeTableDemoTableComponent,
  ],
})
export class TreeTableDemoPanelComponent {

  public readonly parameters$: Observable<{ uuid: string }>;

  constructor(private readonly route: ActivatedRoute) {
    this.parameters$ = this.route.params.pipe(
      map(({ uuid }) => uuid),
      throwIfEmpty('Could not extract the uuid from route'),
      map((uuid) => ({ uuid })),
    );
  }

}
