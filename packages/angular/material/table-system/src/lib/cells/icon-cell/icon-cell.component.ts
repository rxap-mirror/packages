import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { IconConfig } from '@rxap/utilities';
import { IconDirective } from '@rxap/material-directives/icon';
import { MatIconModule } from '@angular/material/icon';


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
