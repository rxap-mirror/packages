import {
  Inject,
  Injectable,
  OnInit,
} from '@angular/core';
import { Method } from '@rxap/pattern';
import { ToggleSubject } from '@rxap/rxjs';
import {
  EMPTY,
  from,
  Observable,
  OperatorFunction,
  ReplaySubject,
  Subject,
  TeardownLogic,
} from 'rxjs';
import {
  startWith,
  switchMap,
  tap,
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
  extends BaseDataSource<Data, BaseDataSourceMetadata, (BaseDataSourceViewer & Parameters) | BaseDataSourceViewer<Parameters>>
  implements OnInit {

  protected override readonly _data$ = new ReplaySubject<Data>(1);

  public override readonly loading$ = new ToggleSubject(false);

  private readonly _refresh = new Subject<void>();

  constructor(
    @Inject(RXAP_DATA_SOURCE_METHOD)
    protected readonly method: Method<Data, Parameters>,
    @Inject(RXAP_DATA_SOURCE_METHOD_WITHOUT_PARAMETERS)
    protected readonly withoutParameters = false,
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

  protected override _connect(viewer: (BaseDataSourceViewer & Parameters) | BaseDataSourceViewer<Parameters>): [ Observable<Data>, TeardownLogic ] | Observable<Data> {
    if (this.withoutParameters) {
      return super._connect(viewer);
    } else {
      return this._refresh.pipe(
        tap(() => this.hasError$.disable()),
        startWith(undefined),
        switchMap<void, Observable<Data>>(() => {
          if (viewer.viewChange && viewer.viewChange !== EMPTY) {
            return (
              viewer.viewChange as Observable<Parameters>
            ).pipe(
              tap(() => this.loading$.enable()),
              switchMap((parameters) => from(this.execute(parameters)).pipe(this.handelExecution())),
            );
          } else {
            this.loading$.enable();
            return from(this.execute(viewer as Parameters)).pipe(this.handelExecution());
          }
        }),
      );
    }
  }

  protected handelExecution(): OperatorFunction<Data, Data> {
    return tap({
      next: () => {
        this.loading$.disable();
      },
      error: (error: any) => {
        this.loading$.disable();
        this.hasError$.enable();
        this.error$.next(error);
      },
    });
  }

  protected async execute(parameters?: Parameters): Promise<Data> {
    return this.method.call(parameters);
  }

  protected async executeWithoutParameters(): Promise<void> {
    this.hasError$.disable();
    this.loading$.enable();
    try {
      const data = await this.method.call();
      this._data$.next(data);
    } catch (error: any) {
      this.hasError$.enable();
      this.error$.next(error);
    } finally {
      this.loading$.disable();
    }
  }

}
