import {
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectRowOptions } from './select-row.options';
import { SelectionModel } from './selection-model';
import { RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS } from './tokens';

@Injectable()
export class SelectRowService<Data = unknown> {
  public selectedRows$: Observable<Data[]>;

  public readonly selectionModel = new SelectionModel<Data>(true);

  public get selectedRows(): Data[] {
    return this.selectionModel.selected;
  }

  constructor(
    @Optional()
    @Inject(RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS)
      options: SelectRowOptions<Data> | null = null,
  ) {
    this.selectionModel = new SelectionModel<Data>(
      options?.multiple,
      options?.selected,
      options?.emitChanges,
      options?.compareWith,
    );
    this.selectedRows$ = this.selectionModel.changed.pipe(
      map(() => this.selectionModel.selected),
    );
  }

  clear() {
    this.selectionModel.clear();
  }

}
