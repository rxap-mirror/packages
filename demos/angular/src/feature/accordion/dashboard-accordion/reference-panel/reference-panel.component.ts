import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { throwIfEmpty } from '@rxap/rxjs';

import { ReferenceTreeTableComponent } from './reference-tree-table/reference-tree-table.component';


@Component({
  selector: 'rxap-reference-panel',
  templateUrl: './reference-panel.component.html',
  styleUrls: [ './reference-panel.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReferenceTreeTableComponent,
  ],
})
export class ReferencePanelComponent {

  public readonly parameters$: Observable<{ uuid: string }>;

  constructor(private readonly route: ActivatedRoute) {
    this.parameters$ = this.route.params.pipe(
      map(({ uuid }) => uuid),
      throwIfEmpty('Could not extract the uuid from route'),
      map((uuid) => ({ uuid })),
    );
  }

}
