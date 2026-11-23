import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Showcase } from '@ng-prism/core';

@Showcase<DateCellComponent>({
  title: 'Date Cell',
  category: 'Table System',
  description: 'Table cell that formats a date, a timestamp or a date string with the angular date pipe.',
  status: 'stable',
  host: { template: '<table><tr><td rxap-date-cell></td></tr></table>' },
  variants: [
    { name: 'Default format', inputs: { date: new Date(2026, 3, 28, 14, 30) } },
    { name: 'Custom format', inputs: { date: new Date(2026, 3, 28, 14, 30), format: 'EEEE, d MMMM y' } },
    { name: 'Timestamp', inputs: { date: 1777386600000 } },
    { name: 'Date string', inputs: { date: '2026-04-28T14:30:00', format: 'shortTime' } },
    { name: 'Empty', description: 'Nothing is rendered for an empty value.', inputs: { date: null } },
  ],
})
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
