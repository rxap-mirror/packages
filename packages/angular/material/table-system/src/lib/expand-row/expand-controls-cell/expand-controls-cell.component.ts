import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { ExpandRowService } from '../expand-row.service';
import { Required } from '@rxap/utilities';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-expand-controls-cell]',
    templateUrl: './expand-controls-cell.component.html',
    styleUrls: ['./expand-controls-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatIconModule, AsyncPipe]
})
export class ExpandControlsCellComponent<Data extends Record<string, any>> {
  readonly expandCell = inject<ExpandRowService<Data>>(ExpandRowService);


  public readonly element = input.required<Data>();

}
