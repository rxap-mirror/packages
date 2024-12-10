import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-boolean-cell]',
    templateUrl: './boolean-cell.component.html',
    styleUrls: ['./boolean-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  
    host: { class: 'rxap-boolean-cell' },
    imports: [NgIf, MatIconModule]
})
export class BooleanCellComponent {

  @Input('rxap-boolean-cell')
  public value: any | null = null;

}
