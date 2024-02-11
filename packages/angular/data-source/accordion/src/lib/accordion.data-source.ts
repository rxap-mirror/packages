import {
  inject,
  Injectable,
  InjectionToken,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BaseDataSource } from '@rxap/data-source';
import { Method } from '@rxap/pattern';
import { ToggleSubject } from '@rxap/rxjs';
import { isPromiseLike } from '@rxap/utilities';
import {
  isObservable,
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
} from 'rxjs';

export type AccordionDataSourceMethod<Data = unknown, Parameters = unknown> = Method<Data, Parameters>;

export const ACCORDION_DATA_SOURCE_METHOD = new InjectionToken<AccordionDataSourceMethod>(
  'accordion-data-source-method');

@Injectable()
export abstract class AccordionDataSource<
  Data = unknown,
  Parameters = unknown
> extends BaseDataSource<Data> implements OnInit, OnDestroy {

  public override _data$ = new ReplaySubject<Data>(1);
  public override readonly loading$ = new ToggleSubject(true);

  protected parameters: Parameters | null = null;

  protected readonly _refresh$ = new Subject<void>();

  protected readonly method = inject<AccordionDataSourceMethod<Data, Parameters>>(ACCORDION_DATA_SOURCE_METHOD);

  protected _subscription: Subscription | null = null;

  public get refresh$(): Observable<void> {
    return this._refresh$.asObservable();
  }

  public abstract getParameters(): Observable<Parameters> | Promise<Parameters> | Parameters;

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this._subscription?.unsubscribe();
  }

  public ngOnInit() {
    const parameters = this.getParameters();
    if (isObservable(parameters)) {
      this._subscription = parameters.subscribe((params) => {
        this.parameters = params;
        return this.load();
      });
    } else if (isPromiseLike(parameters)) {
      parameters.then((params) => {
        this.parameters = params;
        return this.load();
      });
    } else {
      this.parameters = parameters;
      this.load();
    }
  }

  public override refresh(): any {
    const result = this.load();
    if (isPromiseLike(result)) {
      result.then(() => this._refresh$.next());
    } else {
      this._refresh$.next();
    }
  }

  protected async load(): Promise<void> {
    if (!this.parameters) {
      throw new Error('The parameters are not set. Ensure the parameters are set before calling the load method.');
    }
    this.loading$.enable();
    this.hasError$.disable();
    try {
      this._data$.next(await this.method.call(this.parameters));
    } catch (error) {
      console.error(`Fail to load data '${ this.id }' - '${ this.constructor.name }'`);
      this.hasError$.enable();
    } finally {
      this.loading$.disable();
    }
  }

}
