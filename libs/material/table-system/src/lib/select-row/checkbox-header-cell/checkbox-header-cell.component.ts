import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Inject,
} from '@angular/core';
import { SelectRowService } from '../select-row.service';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatLegacyCheckboxChange as MatCheckboxChange } from '@angular/material/legacy-checkbox';
import { CdkTable } from '@angular/cdk/table';

@Component({
  selector: 'th[rxap-checkbox-header-cell]',
  templateUrl: './checkbox-header-cell.component.html',
  styleUrls: ['./checkbox-header-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rxap-checkbox-header-cell' },
})
export class CheckboxHeaderCellComponent<Data extends Record<string, any>>
  implements OnInit
{
  public indeterminate$: Observable<boolean> = EMPTY;
  public checked$: Observable<boolean> = EMPTY;

  public isMultipleSelection = false;

  constructor(
    @Inject(CdkTable)
    private readonly cdkTable: CdkTable<Data>,
    private readonly selectRow: SelectRowService<Data>
  ) {
    this.isMultipleSelection =
      this.selectRow.selectionModel.isMultipleSelection();
  }

  public ngOnInit() {
    this.indeterminate$ = this.selectRow.selectedRows$.pipe(
      map(
        (selectedRows) =>
          !!selectedRows.length &&
          this.cdkTable['_data'].length !== selectedRows.length
      )
    );
    this.checked$ = this.selectRow.selectedRows$.pipe(
      map(
        (selectedRows) =>
          !!selectedRows.length &&
          this.cdkTable['_data'].length === selectedRows.length
      )
    );
  }

  public onChange($event: MatCheckboxChange) {
    if ($event.checked) {
      this.selectRow.selectionModel.select(...this.cdkTable['_data']);
    } else {
      this.selectRow.selectionModel.clear();
    }
  }
}
