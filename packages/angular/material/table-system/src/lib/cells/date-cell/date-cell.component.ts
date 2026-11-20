import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-date-cell]',
    templateUrl: './date-cell.component.html',
    styleUrls: ['./date-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DatePipe]
})
export class DateCellComponent {

  public readonly date = input<Date | number | string | null>(null, { alias: "rxap-date-cell" });

  public readonly format = input('dd.MM.yyyy HH:mm');

}
