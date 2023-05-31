import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
  selector:        'td[rxap-icon-cell]',
  templateUrl:     './icon-cell.component.html',
  styleUrls:       [ './icon-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-icon-cell' },
  standalone:      true,
  imports:         [ NgIf, MatIconModule, IconDirective ]
})
export class IconCellComponent {

  @Input('rxap-icon-cell')
  public icon!: IconConfig | null;

}
