import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import {
  NgIf,
  DatePipe
} from '@angular/common';

@Component({
  selector:        'td[rxap-date-cell]',
  templateUrl:     './date-cell.component.html',
  styleUrls:       [ './date-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-date-cell' },
  standalone:      true,
  imports:         [ NgIf, DatePipe ]
})
export class DateCellComponent {

  @Input('rxap-date-cell')
  public date: Date | number | string | null = null;

  @Input()
  public format: string = 'dd.MM.yyyy HH:mm';

}
