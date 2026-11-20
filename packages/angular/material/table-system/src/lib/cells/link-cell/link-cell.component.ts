import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-link-cell]',
    templateUrl: './link-cell.component.html',
    styleUrls: ['./link-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTooltipModule, MatIconModule]
})
export class LinkCellComponent {

  public readonly value = input<any>(undefined, { alias: "rxap-link-cell" });

  public get href(): string {
    const protocol = this.protocol();
    if (protocol) {
      return [ protocol, this.value() ].join(':');
    }
    return this.value();
  }

  public readonly protocol = input<'tel' | 'mailto'>();

  public readonly short = input(true);

}
