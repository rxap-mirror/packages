import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


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

  @Input('rxap-boolean-cell')
  public value: any | null = null;

}
