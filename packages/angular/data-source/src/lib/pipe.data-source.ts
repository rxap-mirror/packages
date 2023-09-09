import {
  Inject,
  Injectable,
  OnDestroy,
  Optional,
} from '@angular/core';
import { Constructor } from '@rxap/utilities';
import {
  Observable,
  OperatorFunction,
  Subject,
  TeardownLogic,
} from 'rxjs';
import {
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  BaseDataSourceViewer,
  RxapDataSource,
} from './base.data-source';
import { RxapDataSourceError } from './error';
import {
  RXAP_DATA_SOURCE,
  RXAP_PIPE_DATA_SOURCE_OPERATOR,
} from './tokens';

export interface PipeDataSourceMetadata extends BaseDataSourceMetadata {
  /**
   * If true the parent data source will be refreshed when the pipe data source is refreshed
   * @default false
   */
  refreshParent?: boolean;
}

export function RxapPipeDataSource(
  metadata: PipeDataSourceMetadata,
  className = 'PipeDataSource',
  packageName = '@rxap/data-source',
) {
  return function (target: Constructor<PipeDataSource>) {
    RxapDataSource(metadata, className, packageName)(target);
  };
}

@Injectable()
export class PipeDataSource<Source = any, Target = Source>
  extends BaseDataSource<Target>
  implements OnDestroy {

  private readonly _refresh = new Subject<void>();

  constructor(
    @Inject(RXAP_DATA_SOURCE) public readonly dataSource: BaseDataSource<Source>,
    @Optional() @Inject(RXAP_PIPE_DATA_SOURCE_OPERATOR) operation: OperatorFunction<Source, any> | null = null,
    ...operations: Array<OperatorFunction<any, any> | PipeDataSourceMetadata>
  ) {
    super(dataSource.metadata);
    if (operation) {
      this.setOperations(
        operation,
        ...operations.filter(op => typeof op === 'function') as Array<OperatorFunction<any, any>>,
      );
      if (operations.some(op => typeof op !== 'function')) {
        this.metadata = {
          ...this.metadata,
          ...operations.find(op => typeof op !== 'function'),
        };
      }
    }
  }

  private _operations: Array<OperatorFunction<any, any>> = [];

  protected get operations(): Array<OperatorFunction<any, any>> {
    return this._operations;
  }

  public setOperations(
    operation: OperatorFunction<Source, any>,
    ...operations: Array<OperatorFunction<any, any>>
  ): void {
    if (this._initialised) {
      throw new RxapDataSourceError(
        'Can not set operations after the data source is initialised',
        '',
        'PipeDataSource',
      );
    }
    this._operations = [ operation, ...operations ];
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.dataSource.disconnect(this.metadata);
  }

  /**
   * @param parent true - call the refresh method of the parent data source
   */
  public override refresh(parent: boolean = this.metadata['refreshParent'] ?? false): any {
    if (parent) {
      this.dataSource.refresh();
    } else {
      this._refresh.next();
    }
  }

  public override reset(): any {
    return this.dataSource.reset();
  }

  public override toJSON(): object {
    return {
      ...super.toJSON(),
      dataSource: this.dataSource,
    };
  }

  protected override _connect(viewer: BaseDataSourceViewer): [ Observable<Target>, TeardownLogic ] {
    this.init();
    return [
      this.dataSource.connect(viewer).pipe(
        switchMap(data => this._refresh.pipe(
          startWith(null),
          map(() => data),
        )),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...this.operations,
      ),
      () => this.dataSource.disconnect(viewer),
    ];
  }

}

export function pipeDataSource<Source, Target>(
  dataSource: BaseDataSource<Source>,
  operation: OperatorFunction<Source, any>,
  ...operations: Array<OperatorFunction<any, any> | PipeDataSourceMetadata>
): PipeDataSource<Source, Target> {
  return new PipeDataSource<Source, Target>(dataSource, operation, ...operations);
}
