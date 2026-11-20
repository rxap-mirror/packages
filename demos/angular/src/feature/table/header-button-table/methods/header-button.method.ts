import { Method } from '@rxap/pattern';
import { Injectable, inject } from '@angular/core';
import { TableHeaderButtonMethod } from '@rxap/material-table-system';
import { OpenHeaderButtonFormWindowMethod } from '../header-button-form/open-header-button-form-window.method';

@Injectable()
@TableHeaderButtonMethod({})
export class HeaderButtonMethod implements Method {
  private readonly openWindowMethod = inject(OpenHeaderButtonFormWindowMethod);

  call(parameters?: any): any {
    return this.openWindowMethod.call(parameters).toPromise();
  }
}
