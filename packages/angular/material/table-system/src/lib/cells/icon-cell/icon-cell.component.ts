import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';
import { Showcase } from '@ng-prism/core';


@Showcase<IconCellComponent>({
  title: 'Icon Cell',
  category: 'Table System',
  description: 'Table cell that shows a material icon from an icon config.',
  status: 'stable',
  host: { template: '<table><tr><td rxap-icon-cell></td></tr></table>' },
  variants: [
    { name: 'Icon name', inputs: { icon: 'home' } },
    { name: 'Colored', inputs: { icon: { icon: 'favorite', fontColor: 'crimson' } } },
    { name: 'Theme color', inputs: { icon: { icon: 'check_circle', color: 'primary' } } },
    { name: 'Empty', description: 'No icon is rendered for an empty config.', inputs: { icon: null } },
  ],
})
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-icon-cell]',
    templateUrl: './icon-cell.component.html',
    styleUrls: ['./icon-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule, IconDirective]
})
export class IconCellComponent {

  public readonly icon = input.required<IconConfig | null>({ alias: "rxap-icon-cell" });

}
