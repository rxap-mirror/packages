import { Method } from '@rxap/pattern';
import { Injectable, inject } from '@angular/core';
import { TableHeaderButtonMethod } from '@rxap/material-table-system';
import { OpenMaximumTreeFormWindowMethod } from '../maximum-tree-form/open-maximum-tree-form-window.method';

@Injectable()
@TableHeaderButtonMethod({})
export class HeaderButtonMethod implements Method {
  private readonly openWindowMethod = inject(OpenMaximumTreeFormWindowMethod);

  call(parameters?: any): any {
    return this.openWindowMethod.call(parameters).toPromise();
  }
}
