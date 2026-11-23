import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Showcase } from '@ng-prism/core';


@Showcase<BooleanCellComponent>({
  title: 'Boolean Cell',
  category: 'Table System',
  description: 'Table cell that shows a boolean value as an icon.',
  status: 'stable',
  host: { template: '<table><tr><td rxap-boolean-cell></td></tr></table>' },
  variants: [
    { name: 'True', inputs: { value: true } },
    { name: 'False', inputs: { value: false } },
    { name: 'Empty', description: 'A null value is shown like false.', inputs: { value: null } },
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
