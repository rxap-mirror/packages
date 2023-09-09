import {
  Inject,
  Injectable,
  OnInit,
} from '@angular/core';
import { Method } from '@rxap/pattern';
import {
  Observable,
  ReplaySubject,
  Subject,
  TeardownLogic,
} from 'rxjs';
import {
  startWith,
  switchMap,
} from 'rxjs/operators';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  BaseDataSourceViewer,
} from './base.data-source';
import {
  RXAP_DATA_SOURCE_METHOD,
  RXAP_DATA_SOURCE_METHOD_WITHOUT_PARAMETERS,
} from './tokens';

@Injectable()
export class MethodDataSource<Data, Parameters = any>
  extends BaseDataSource<Data, BaseDataSourceMetadata, BaseDataSourceViewer & Parameters> implements OnInit {

  protected override readonly _data$ = new ReplaySubject<Data>(1);
  private readonly _refresh = new Subject<void>();

  constructor(
    @Inject(RXAP_DATA_SOURCE_METHOD)
    protected readonly method: Method<Data, Parameters>,
    @Inject(RXAP_DATA_SOURCE_METHOD_WITHOUT_PARAMETERS)
    protected readonly withoutParameters: boolean = false,
  ) {
    super(method.metadata);
  }

  public ngOnInit(): void {
    if (this.withoutParameters) {
      this.executeWithoutParameters();
    }
  }

  public override refresh(): void {
    this._refresh.next();
    if (this.withoutParameters) {
      this.executeWithoutParameters();
    }
  }

  protected override _connect(viewer: BaseDataSourceViewer & Parameters): [ Observable<Data>, TeardownLogic ] | Observable<Data> {
    if (this.withoutParameters) {
      return super._connect(viewer);
    } else {
      return this._refresh.pipe(
        startWith(undefined),
        switchMap(async () => this.method.call(viewer)),
      );
    }
  }

  private async executeWithoutParameters(): Promise<void> {
    const data = await this.method.call();
    this._data$.next(data);
  }

}
