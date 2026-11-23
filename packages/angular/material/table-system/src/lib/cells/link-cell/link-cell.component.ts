import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Showcase } from '@ng-prism/core';


@Showcase<LinkCellComponent>({
  title: 'Link Cell',
  category: 'Table System',
  description: 'Table cell that shows the value as link. The protocol input turns the value into a tel or mailto link.',
  status: 'stable',
  host: { template: '<table><tr><td rxap-link-cell></td></tr></table>' },
  variants: [
    { name: 'Short', description: 'Shows only a short label with an icon. The value is the tooltip.', inputs: { value: 'https://example.com' } },
    { name: 'Long', description: 'Shows the complete value.', inputs: { value: 'https://example.com', short: false } },
    { name: 'Phone', inputs: { value: '+4930123456', protocol: 'tel', short: false } },
    { name: 'Mail', inputs: { value: 'info@example.com', protocol: 'mailto', short: false } },
    { name: 'Empty', description: 'No link is rendered for an empty value.', inputs: { value: null } },
  ],
})
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
