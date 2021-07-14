import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';

@Component({
  selector:        'td[rxap-icon-cell]',
  templateUrl:     './icon-cell.component.html',
  styleUrls:       [ './icon-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rxap-icon-cell' }
})
export class IconCellComponent {

  @Input('rxap-icon-cell')
  public icon!: IconConfig | null;

}
