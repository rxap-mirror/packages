import { Injectable } from '@angular/core';
import { TableHeaderButtonMethod } from '@rxap/material-table-system';
import { Method } from '@rxap/pattern';
import { OpenTableHeaderButtonFormWindowMethod } from '../table-header-button-form/open-table-header-button-form-window.method';

@Injectable()
@TableHeaderButtonMethod({
  refresh: true,
})
export class TableHeaderButtonFormMethod implements Method {
  constructor(private readonly openWindowMethod: OpenTableHeaderButtonFormWindowMethod) {
  }

  call(parameters?: any): any {
    return this.openWindowMethod.call(parameters).toPromise();
  }
}
