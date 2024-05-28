import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import { TableHeaderButtonMethod } from '@rxap/material-table-system';
import { OpenMaximumTreeFormWindowMethod } from '../maximum-tree-form/open-maximum-tree-form-window.method';

@Injectable()
@TableHeaderButtonMethod({})
export class HeaderButtonMethod implements Method {
  constructor(
    private readonly openWindowMethod: OpenMaximumTreeFormWindowMethod
  ) {}

  call(parameters?: any): any {
    return this.openWindowMethod.call(parameters).toPromise();
  }
}
