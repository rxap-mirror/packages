import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  Input
} from '@angular/core';
import {
  Method,
  Required
} from '@rxap/utilities';
import { TABLE_CREATE_REMOTE_METHOD } from './tokens';
import {
  isObservable,
  Observable
} from 'rxjs';
import { TableDataSourceDirective } from '../table-data-source.directive';

@Component({
  selector:        'mfd-table-create-button',
  templateUrl:     './table-create-button.component.html',
  styleUrls:       [ './table-create-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'mfd-table-create-button' }
})
export class TableCreateButtonComponent<Data extends Record<string, any>> {

  @Input()
  @Required
  public dataSource!: TableDataSourceDirective<Data>;

  constructor(
    @Inject(TABLE_CREATE_REMOTE_METHOD)
    private readonly remoteMethod: Method<any, Data | Observable<Data>>
  ) {}

  public async onClick() {
    const result = await this.remoteMethod.call();
    if (isObservable(result)) {
      await result.toPromise();
    }
    this.dataSource.refresh();
  }

}
