import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { ExpandRowService } from '../expand-row.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-expand-controls-cell]',
    templateUrl: './expand-controls-cell.component.html',
    styleUrls: ['./expand-controls-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatIconModule]
})
export class ExpandControlsCellComponent<Data extends Record<string, any>> {
  readonly expandCell = inject<ExpandRowService<Data>>(ExpandRowService);


  public readonly element = input.required<Data>();

}
