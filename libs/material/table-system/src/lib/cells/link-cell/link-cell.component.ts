import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatLegacyTooltipModule } from '@angular/material/legacy-tooltip';
import {
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault
} from '@angular/common';

@Component({
  selector:        'td[rxap-link-cell]',
  templateUrl:     './link-cell.component.html',
  styleUrls:       [ './link-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-link-cell' },
  standalone:      true,
  imports:         [ NgIf, MatLegacyTooltipModule, FlexModule, NgSwitch, NgSwitchCase, MatIconModule, NgSwitchDefault ]
})
export class LinkCellComponent {

  @Input('rxap-link-cell')
  public value: any;

  public get href(): string {
    if (this.protocol) {
      return [ this.protocol, this.value ].join(':');
    }
    return this.value;
  }

  @Input()
  public protocol?: 'tel' | 'mailto';

  @Input()
  public short = true;

}
