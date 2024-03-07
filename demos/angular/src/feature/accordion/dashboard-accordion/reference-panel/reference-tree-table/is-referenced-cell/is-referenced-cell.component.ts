import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { IReferenceTreeTable } from '../reference-tree-table';

@Component({
    standalone: true,
  // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[mat-cell][rxap-is-referenced]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './is-referenced-cell.component.html',
    styleUrls: ['./is-referenced-cell.component.scss']
  })
export class IsReferencedCellComponent {
  @Input({
      required: true
    })
  public element!: IReferenceTreeTable;
  @Input({
      required: true
    })
  public value!: boolean;
}
