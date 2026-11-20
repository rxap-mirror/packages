import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  input
} from '@angular/core';
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

  public readonly element = input.required<Data>({ alias: "rxap-expand-controls-cell" });

  constructor(
    @Inject(ExpandRowService)
    public readonly expandCell: ExpandRowService<Data>,
  ) {
  }

}
