import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[rxap-link-cell]',
  templateUrl: './link-cell.component.html',
  styleUrls: [ './link-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ NgIf, MatTooltipModule, FlexModule, NgSwitch, NgSwitchCase, MatIconModule, NgSwitchDefault ],
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
