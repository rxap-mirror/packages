import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';

@Component({
  selector:        'td[rxap-link-cell]',
  templateUrl:     './link-cell.component.html',
  styleUrls:       [ './link-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-link-cell' }
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

}
