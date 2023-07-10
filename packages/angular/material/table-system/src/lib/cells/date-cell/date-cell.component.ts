import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import {
  NgIf,
  DatePipe,
} from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[rxap-date-cell]',
  templateUrl: './date-cell.component.html',
  styleUrls: ['./date-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, DatePipe],
})
export class DateCellComponent {

  @Input('rxap-date-cell')
  public date: Date | number | string | null = null;

  @Input()
  public format = 'dd.MM.yyyy HH:mm';

}
