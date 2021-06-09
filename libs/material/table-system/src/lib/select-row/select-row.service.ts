import { Injectable, Optional, Inject } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectRowOptions } from './select-row.options';
import { RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS } from './tokens';

@Injectable()
export class SelectRowService<Data extends Record<string, any>> {
  public selectedRows$: Observable<Data[]>;

  public readonly selectionModel = new SelectionModel<Data>(true);

  public get selectedRows(): Data[] {
    return this.selectionModel.selected;
  }

  constructor(
    @Optional()
    @Inject(RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS)
    options: SelectRowOptions<Data> | null = null
  ) {
    this.selectionModel = new SelectionModel<Data>(options?.multiple);
    if (options?.selected) {
      this.selectionModel.select(...options?.selected);
    }
    this.selectedRows$ = this.selectionModel.changed.pipe(
      map(() => this.selectionModel.selected)
    );
  }
}
