import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Inject
} from '@angular/core';
import { ExpandRowService } from '../expand-row.service';
import { Required } from '@rxap/utilities';
import { MatIconModule } from '@angular/material/icon';
import {
  NgIf,
  AsyncPipe
} from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  // tslint:disable-next-line:component-selector
  selector:        'td[rxap-expand-controls-cell]',
  templateUrl:     './expand-controls-cell.component.html',
  styleUrls:       [ './expand-controls-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-expand-controls-cell' },
  standalone:      true,
  imports:         [ MatButtonModule, NgIf, MatIconModule, AsyncPipe ]
})
export class ExpandControlsCellComponent<Data extends Record<string, any>> {

  @Input()
  @Required
  public element!: Data;

  constructor(
    @Inject(ExpandRowService)
    public readonly expandCell: ExpandRowService<Data>
  ) {}

}
