import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectRowService } from '../select-row.service';
import { map } from 'rxjs/operators';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { CdkTable } from '@angular/cdk/table';
import { Showcase } from '@ng-prism/core';

@Showcase<CheckboxHeaderCellComponent<any>>({
  title: 'Checkbox Header Cell (Basic)',
  category: 'Table System (Basic)',
  description: 'Header cell with a checkbox that selects or deselects all rows of the table.',
  status: 'stable',
  imports: [{ name: 'MatTableModule', from: '@angular/material/table' }],
  host: {
    template: `
      <table mat-table [dataSource]="[{ id: 'row-1', name: 'Alice' }, { id: 'row-2', name: 'Bob' }, { id: 'row-3', name: 'Carol' }]">
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef rxap-checkbox-header-cell></th>
          <td mat-cell *matCellDef="let element" rxap-checkbox-cell [element]="element"></td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let element">{{ element.name }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="['select', 'name']"></tr>
        <tr mat-row *matRowDef="let row; columns: ['select', 'name']"></tr>
      </table>
    `,
  },
  variants: [
    { name: 'In a table', description: 'Select all rows with the header checkbox.' },
  ],
})
@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'th[rxap-checkbox-header-cell]',
    templateUrl: './checkbox-header-cell.component.html',
    styleUrls: ['./checkbox-header-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatCheckboxModule]
})
export class CheckboxHeaderCellComponent<Data extends Record<string, any>> {
  private readonly cdkTable = inject<CdkTable<Data>>(CdkTable);
  private readonly selectRow = inject<SelectRowService<Data>>(SelectRowService);


  public readonly indeterminate = toSignal(
    this.selectRow.selectedRows$.pipe(
      map(selectedRows => !!selectedRows.length && this.cdkTable['_data']?.length !== selectedRows.length),
    ),
    { initialValue: false },
  );
  public readonly checked = toSignal(
    this.selectRow.selectedRows$.pipe(
      map(selectedRows => !!selectedRows.length && this.cdkTable['_data']?.length === selectedRows.length),
    ),
    { initialValue: false },
  );

  public onChange($event: MatCheckboxChange) {
    if ($event.checked) {
      this.selectRow.selectionModel.select(...this.cdkTable['_data'] ?? []);
    } else {
      this.selectRow.selectionModel.clear();
    }
  }

}
