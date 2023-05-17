import {
  BaseDataSource,
  BaseDataSourceViewer,
  BaseDataSourceMetadata
} from './base.data-source';
import {
  OperatorFunction,
  Observable,
  TeardownLogic,
  Subject
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
import {
  switchMap,
  startWith,
  map
} from 'rxjs/operators';

export interface PipeDataSourceMetadata extends BaseDataSourceMetadata {
  refreshParent?: boolean;
}

@Injectable()
export class PipeDataSource<Source = any, Target = Source>
  extends BaseDataSource<Target>
  implements OnDestroy {

  protected get operations(): Array<OperatorFunction<any, any>> {
    return this._operations;
  }

  private _operations: Array<OperatorFunction<any, any>> = [];

  private readonly _refresh = new Subject<void>();

  constructor(
    @Inject(RXAP_DATA_SOURCE) public readonly dataSource: BaseDataSource<Source>,
    @Optional() @Inject(RXAP_PIPE_DATA_SOURCE_OPERATOR) operation: OperatorFunction<Source, any> | null = null,
    ...operations: Array<OperatorFunction<any, any> | PipeDataSourceMetadata>
  ) {
    super(dataSource.metadata);
    if (operation) {
      this.setOperations(operation, ...operations.filter(op => typeof op === 'function') as Array<OperatorFunction<any, any>>);
      if (operations.some(op => typeof op !== 'function')) {
        this.metadata = {
          ...this.metadata,
          ...operations.find(op => typeof op !== 'function')
        };
      }
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
        switchMap(data => this._refresh.pipe(
          startWith(null),
          map(() => data),
        )),
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

  /**
   * @param parent true - call the refresh method of the parent data source
   */
  public refresh(parent: boolean = this.metadata.refreshParent ?? false): any {
    if (parent) {
      this.dataSource.refresh();
    } else {
      this._refresh.next();
    }
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
  ...operations: Array<OperatorFunction<any, any> | PipeDataSourceMetadata>
): PipeDataSource<Source, Target> {
  return new PipeDataSource<Source, Target>(dataSource, operation, ...operations);
}
