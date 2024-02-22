import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReferenceTreeTableComponent } from './reference-tree-table/reference-tree-table.component';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { throwIfEmpty } from '@rxap/rxjs';

@Component({
    standalone: true,
    selector: 'rxap-reference-panel',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './reference-panel.component.html',
    styleUrls: ['./reference-panel.component.scss'],
  imports: [ReferenceTreeTableComponent],
})
export class ReferencePanelComponent {
  public readonly parameters$ = inject(ActivatedRoute).params.pipe(map(({ uuid }) => uuid), throwIfEmpty('Could not extract the uuid from route'), map((uuid) => ({ uuid })));
}
