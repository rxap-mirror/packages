import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector:        'td[rxap-link-cell]',
  templateUrl:     './link-cell.component.html',
  styleUrls:       [ './link-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'mfd-link-cell' }
})
export class LinkCellComponent {

  @Input('rxap-link-cell')
  public value: any;

}
