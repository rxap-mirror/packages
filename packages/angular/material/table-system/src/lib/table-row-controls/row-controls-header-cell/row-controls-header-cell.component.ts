import {ChangeDetectionStrategy, Component, Inject, Optional} from '@angular/core';
import {TableFilterService} from '../../table-filter/table-filter.service';
import type {Observable} from 'rxjs';
import {of} from 'rxjs';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {ROW_ARCHIVE_METHOD, ROW_DELETE_METHOD, ROW_RESTORE_METHOD} from '../tokens';
import {TableDataSourceDirective} from '../../table-data-source.directive';
import {SelectRowService} from '../../select-row/select-row.service';
import {OpenApiRemoteMethod} from '@rxap/open-api/remote-method';
import {Method} from '@rxap/pattern';
import {MatIconModule} from '@angular/material/icon';
import {ConfirmDirective} from '@rxap/components';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {AsyncPipe, NgIf} from '@angular/common';
import {FlexModule} from '@angular/flex-layout/flex';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'th[rxap-row-controls-header-cell]',
  templateUrl: './row-controls-header-cell.component.html',
  styleUrls: ['./row-controls-header-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FlexModule,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    ConfirmDirective,
    MatIconModule,
    AsyncPipe,
  ],
})
export class RowControlsHeaderCellComponent<Data extends Record<string, any>> {
  public showArchive$: Observable<boolean>;

  public showUnarchive$: Observable<boolean>;

  public showDelete$: Observable<boolean>;

  public disabled$: Observable<boolean>;

  constructor(
    private readonly tableDataSource: TableDataSourceDirective<Data>,
    @Optional()
    @Inject(TableFilterService)
    private readonly tableFilter: TableFilterService | null = null,
    @Optional()
    @Inject(SelectRowService)
    public readonly selectRow: SelectRowService<Data> | null = null,
    @Optional()
    @Inject(ROW_DELETE_METHOD)
    private readonly deleteRemoteMethod: OpenApiRemoteMethod<
      any,
      { uuid: string }
    > & Method | null = null,
    @Optional()
    @Inject(ROW_ARCHIVE_METHOD)
    private readonly archiveRemoteMethod: OpenApiRemoteMethod<
      any,
      { uuid: string }
    > & Method | null = null,
    @Optional()
    @Inject(ROW_RESTORE_METHOD)
    private readonly unarchiveRemoteMethod: OpenApiRemoteMethod<
      any,
      { uuid: string }
    > & Method | null = null,
  ) {
    this.disabled$ =
      this.selectRow?.selectedRows$.pipe(
        map((selectedRows) => selectedRows.length === 0),
        startWith(true),
      ) ?? of(true);
    this.showUnarchive$ = this.showDelete$ =
      this.tableFilter?.change.pipe(
        map(
          (filter) =>
            filter &&
            filter['__archived'] !== undefined &&
            filter['__archived'] === true,
        ),
        distinctUntilChanged(),
      ) ?? of(false);
    this.showArchive$ =
      this.tableFilter?.change.pipe(
        map(
          (filter) =>
            !filter ||
            filter['__archived'] === undefined ||
            filter['__archived'] === false,
        ),
        distinctUntilChanged(),
      ) ?? of(true);
    if (!this.archiveRemoteMethod) {
      this.showArchive$ = of(false);
    }
    if (!this.unarchiveRemoteMethod) {
      this.showUnarchive$ = of(false);
    }
    if (!this.deleteRemoteMethod) {
      this.showDelete$ = of(false);
    }
  }

  public async archiveSelected(selectedRows: Data[] | undefined) {
    if (this.archiveRemoteMethod && selectedRows) {
      await Promise.all(
        selectedRows.map((selectedRow) =>
          this.archiveRemoteMethod?.call({
            parameters: {uuid: selectedRow['uuid']},
          }),
        ),
      );
      this.tableDataSource.refresh();
    }
  }

  public async unarchiveSelected(selectedRows: Data[] | undefined) {
    if (this.unarchiveRemoteMethod && selectedRows) {
      await Promise.all(
        selectedRows.map((selectedRow) =>
          this.unarchiveRemoteMethod?.call({
            parameters: {uuid: selectedRow['uuid']},
          }),
        ),
      );
      this.tableDataSource.refresh();
    }
  }

  public async deleteSelected(selectedRows: Data[] | undefined) {
    if (this.deleteRemoteMethod && selectedRows) {
      await Promise.all(
        selectedRows.map((selectedRow) =>
          this.deleteRemoteMethod?.call({
            parameters: {uuid: selectedRow['uuid']},
          }),
        ),
      );
      this.tableDataSource.refresh();
    }
  }
}
