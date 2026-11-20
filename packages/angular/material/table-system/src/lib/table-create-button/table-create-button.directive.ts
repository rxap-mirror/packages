import { Directive, OnDestroy, input, inject } from '@angular/core';
import { Method } from '@rxap/pattern';
import {
  isObservable,
  Observable,
  Subject,
} from 'rxjs';
import { TableDataSourceDirective } from '../table-data-source.directive';
import { TABLE_CREATE_REMOTE_METHOD } from './tokens';

@Directive({
  selector: 'button[rxapTableCreate]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
    'style': 'margin-bottom: 6px',
  },
})
export class TableCreateButtonDirective<Data extends Record<string, any>>
  implements OnDestroy {
  private readonly method = inject<Method<any, Data | Observable<Data>>>(TABLE_CREATE_REMOTE_METHOD);

  public readonly dataSource = input.required<TableDataSourceDirective<Data>>({ alias: "rxapTableCreate" });

  private _createObservable?: Observable<any>;

  public ngOnDestroy() {
    if (this._createObservable instanceof Subject) {
      this._createObservable.complete();
    }
  }

  public async onClick() {
    const result = this._createObservable = await this.method.call();
    if (isObservable(result)) {
      await result.toPromise();
    }
    this.dataSource().refresh();
  }
}


