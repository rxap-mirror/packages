import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Inject,
} from '@angular/core';
import {ExpandRowService} from '../expand-row.service';
import {Required} from '@rxap/utilities';
import {MatIconModule} from '@angular/material/icon';
import {
  NgIf,
  AsyncPipe,
} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[rxap-expand-controls-cell]',
  templateUrl: './expand-controls-cell.component.html',
  styleUrls: ['./expand-controls-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, NgIf, MatIconModule, AsyncPipe],
})
export class ExpandControlsCellComponent<Data extends Record<string, any>> {

  @Input('rxap-expand-controls-cell')
  @Required
  public element!: Data;

  constructor(
    @Inject(ExpandRowService)
    public readonly expandCell: ExpandRowService<Data>,
  ) {
  }

}
