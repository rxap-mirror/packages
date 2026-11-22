import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Showcase } from '@ng-prism/core';


@Showcase({
  title: 'Boolean Cell',
  category: 'Table System',
  description: 'Table cell that shows a boolean value as an icon.',
  status: 'stable',
  host: { template: '<table><tr><td [rxap-boolean-cell]="true"></td><td [rxap-boolean-cell]="false"></td><td [rxap-boolean-cell]="null"></td></tr></table>' },
  variants: [
    { name: 'True, false and null' },
  ],
})
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-boolean-cell]',
    templateUrl: './boolean-cell.component.html',
    styleUrls: ['./boolean-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  
    host: { class: 'rxap-boolean-cell' },
    imports: [MatIconModule]
})
export class BooleanCellComponent {

  public readonly value = input<any | null>(null, { alias: "rxap-boolean-cell" });

}
