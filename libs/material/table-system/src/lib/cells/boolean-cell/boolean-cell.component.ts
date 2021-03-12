import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector:        'td[rxap-boolean-cell]',
  templateUrl:     './boolean-cell.component.html',
  styleUrls:       [ './boolean-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-boolean-cell' },
})
export class BooleanCellComponent {

  @Input('rxap-boolean-cell')
  public value: any | null = null;

}
