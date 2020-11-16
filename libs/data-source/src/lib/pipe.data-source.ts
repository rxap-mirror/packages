import {
  BaseDataSource,
  BaseDataSourceViewer
} from './base.data-source';
import {
  OperatorFunction,
  Observable,
  TeardownLogic
} from 'rxjs';
import {
  Injectable,
  Inject,
  Optional,
  OnDestroy
} from '@angular/core';
import {
  RXAP_DATA_SOURCE,
  RXAP_PIPE_DATA_SOURCE_OPERATOR
} from './tokens';
import { RxapDataSourceError } from './error';

@Injectable()
export class PipeDataSource<Source = any, Target = Source>
  extends BaseDataSource<Target>
  implements OnDestroy {

  protected get operations(): Array<OperatorFunction<any, any>> {
    return this._operations;
  }

  private _operations: Array<OperatorFunction<any, any>> = [];

  constructor(
    @Inject(RXAP_DATA_SOURCE) public readonly dataSource: BaseDataSource<Source>,
    @Optional() @Inject(RXAP_PIPE_DATA_SOURCE_OPERATOR) operation: OperatorFunction<Source, any> | null = null,
    ...operations: Array<OperatorFunction<any, any>>
  ) {
    super(dataSource.metadata);
    if (operation) {
      this.setOperations(operation, ...operations);
    }
  }

  public setOperations(operation: OperatorFunction<Source, any>, ...operations: Array<OperatorFunction<any, any>>): void {
    if (this._initialised) {
      throw new RxapDataSourceError('Can not set operations after the data source is initialised', '', 'PipeDataSource');
    }
    this._operations = [ operation, ...operations ];
  }

  protected _connect(viewer: BaseDataSourceViewer): [ Observable<Target>, TeardownLogic ] {
    this.init();
    return [
      this.dataSource.connect(viewer).pipe(
        // @ts-ignore
        ...this.operations
      ),
      () => this.dataSource.disconnect(viewer)
    ];
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    this.dataSource.disconnect(this.metadata);
  }

  public refresh(): any {
    return this.dataSource.refresh();
  }

  public reset(): any {
    return this.dataSource.reset();
  }

  public toJSON(): object {
    return {
      ...super.toJSON(),
      dataSource: this.dataSource
    };
  }

}

export function pipeDataSource<Source, Target>(
  dataSource: BaseDataSource<Source>,
  operation: OperatorFunction<Source, any>,
  ...operations: Array<OperatorFunction<any, any>>
): PipeDataSource<Source, Target> {
  return new PipeDataSource<Source, Target>(dataSource, operation, ...operations);
}
