import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { IReferenceTreeTable } from '../reference-tree-table';

@Component({
    standalone: true,
  // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[mat-cell][rxap-scope-type-cell]',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './scope-type-cell.component.html',
    styleUrls: ['./scope-type-cell.component.scss']
  })
export class ScopeTypeCellComponent {
  @Input({
      required: true
    })
  public element!: IReferenceTreeTable;
  @Input({
      required: true
    })
  public value!: number;
}
