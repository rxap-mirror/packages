import { Injectable } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SelectRowService<Data extends Record<string, any>> {

  public selectedRows$: Observable<Data[]>;

  public readonly selectionModel = new SelectionModel<Data>(true);

  constructor() {
    this.selectedRows$ = this.selectionModel.changed.pipe(map(() => this.selectionModel.selected));
  }

  public get selectedRows(): Data[] {
    return this.selectionModel.selected;
  }

}
