import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectRowService } from '../select-row.service';
import { map } from 'rxjs/operators';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { CdkTable } from '@angular/cdk/table';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'th[rxap-checkbox-header-cell]',
    templateUrl: './checkbox-header-cell.component.html',
    styleUrls: ['./checkbox-header-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    MatCheckboxModule,
]
})
export class CheckboxHeaderCellComponent<Data extends Record<string, any>> {
  private readonly cdkTable = inject<CdkTable<Data>>(CdkTable);
  private readonly selectRow = inject<SelectRowService<Data>>(SelectRowService);

  public readonly indeterminate = toSignal(this.selectRow.selectedRows$.pipe(
    map(
      (selectedRows) =>
        !!selectedRows.length &&
        this.cdkTable['_data']?.length !== selectedRows.length,
    ),
  ), { initialValue: false });

  public readonly checked = toSignal(this.selectRow.selectedRows$.pipe(
    map(
      (selectedRows) =>
        !!selectedRows.length &&
        this.cdkTable['_data']?.length === selectedRows.length,
    ),
  ), { initialValue: false });

  public readonly isMultipleSelection = this.selectRow.selectionModel.isMultipleSelection();

  public onChange($event: MatCheckboxChange) {
    if ($event.checked) {
      this.selectRow.selectionModel.select(...this.cdkTable['_data'] ?? []);
    } else {
      this.selectRow.selectionModel.clear();
    }
  }
}
