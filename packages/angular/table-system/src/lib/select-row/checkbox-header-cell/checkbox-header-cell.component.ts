import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { SelectRowService } from '../select-row.service';
import {
  EMPTY,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { CdkTable } from '@angular/cdk/table';
import { AsyncPipe } from '@angular/common';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'th[rxap-checkbox-header-cell]',
    templateUrl: './checkbox-header-cell.component.html',
    styleUrls: ['./checkbox-header-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatCheckboxModule, AsyncPipe]
})
export class CheckboxHeaderCellComponent<Data extends Record<string, any>> implements OnInit {
  private readonly cdkTable = inject<CdkTable<Data>>(CdkTable);
  private readonly selectRow = inject<SelectRowService<Data>>(SelectRowService);


  public indeterminate$: Observable<boolean> = EMPTY;
  public checked$: Observable<boolean> = EMPTY;

  public ngOnInit() {
    this.indeterminate$ = this.selectRow.selectedRows$.pipe(
      map(selectedRows => !!selectedRows.length && this.cdkTable['_data']?.length !== selectedRows.length),
    );
    this.checked$ = this.selectRow.selectedRows$.pipe(
      map(selectedRows => !!selectedRows.length && this.cdkTable['_data']?.length === selectedRows.length),
    );
  }

  public onChange($event: MatCheckboxChange) {
    if ($event.checked) {
      this.selectRow.selectionModel.select(...this.cdkTable['_data'] ?? []);
    } else {
      this.selectRow.selectionModel.clear();
    }
  }

}
