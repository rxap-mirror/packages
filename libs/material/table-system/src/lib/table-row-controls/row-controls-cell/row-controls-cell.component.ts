import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  Optional
} from '@angular/core';
import { Required } from '@rxap/utilities';
import {
  ROW_ARCHIVE_METHOD,
  ROW_DELETE_METHOD,
  ROW_EDIT_LOADER_METHOD,
  ROW_EDIT_METHOD,
  ROW_LINK_METHOD,
  ROW_RESTORE_METHOD,
  ROW_VIEW_METHOD
} from '../tokens';
import { OpenApiRemoteMethod } from '@rxap/open-api/remote-method';
import { TableDataSourceDirective } from '../../table-data-source.directive';
import {
  isObservable,
  Observable
} from 'rxjs';
import { Method } from '@rxap/utilities/rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDirective } from '@rxap/components';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector:        'td[mfd-row-controls-cell]',
  templateUrl:     './row-controls-cell.component.html',
  styleUrls:       [ './row-controls-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'mfd-row-controls-cell' },
  standalone:      true,
  imports:         [ FlexModule, NgIf, MatButtonModule, MatTooltipModule, ConfirmDirective, MatIconModule ]
})
export class RowControlsCellComponent<Data extends Record<string, any> & { uuid: string }> {

  @Input()
  @Required
  public element!: Data;

  constructor(
    private readonly tableDataSource: TableDataSourceDirective<Data>,
    @Optional()
    @Inject(ROW_DELETE_METHOD)
    public readonly deleteRemoteMethod: OpenApiRemoteMethod<any, { uuid: string }> & Method | null    = null,
    @Optional()
    @Inject(ROW_ARCHIVE_METHOD)
    public readonly archiveRemoteMethod: OpenApiRemoteMethod<any, { uuid: string }> & Method | null   = null,
    @Optional()
    @Inject(ROW_RESTORE_METHOD)
    public readonly unarchiveRemoteMethod: OpenApiRemoteMethod<any, { uuid: string }> & Method | null = null,
    @Optional()
    @Inject(ROW_EDIT_METHOD)
    public readonly editRemoteMethod: Method<any, Data | Observable<Data>> | null            = null,
    @Optional()
    @Inject(ROW_VIEW_METHOD)
    public readonly rowViewMethod: Method<any, { uuid: string }> | null                      = null,
    @Optional()
    @Inject(ROW_LINK_METHOD)
    public readonly rowLinkMethod: Method<any, { uuid: string }> | null                      = null,
    @Optional()
    @Inject(ROW_EDIT_LOADER_METHOD)
    public readonly editLoaderMethod: Method<any, Data> | null                               = null
  ) {}

  public async archive() {
    if (this.archiveRemoteMethod) {
      await this.archiveRemoteMethod.call({ parameters: { uuid: this.element.uuid } });
      this.tableDataSource.refresh();
    }
  }

  public async unarchive() {
    if (this.unarchiveRemoteMethod) {
      await this.unarchiveRemoteMethod.call({ parameters: { uuid: this.element.uuid } });
      this.tableDataSource.refresh();
    }
  }

  public async remove() {
    if (this.deleteRemoteMethod) {
      await this.deleteRemoteMethod.call({ parameters: { uuid: this.element.uuid } });
      this.tableDataSource.refresh();
    }
  }

  public async view() {
    if (this.rowViewMethod) {
      await this.rowViewMethod.call(this.element);
    }
  }

  public async link() {
    if (this.rowLinkMethod) {
      await this.rowLinkMethod.call(this.element);
    }
  }

  public async edit() {
    if (this.editRemoteMethod) {
      let initial = this.element;
      if (this.editLoaderMethod) {
        initial = await this.editLoaderMethod.call(initial);
      }
      const result = await this.editRemoteMethod.call(initial, { context: this.element });
      if (isObservable(result)) {
        await result.toPromise();
      }
      this.tableDataSource.refresh();
    }
  }
}
