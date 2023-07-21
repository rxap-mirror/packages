import {
  Inject,
  Injectable,
  InjectionToken,
  OnInit,
} from '@angular/core';
import { BaseDataSource } from '@rxap/data-source';
import {
  Observable,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  isDefined,
  ToggleSubject,
} from '@rxap/rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  map,
  tap,
} from 'rxjs/operators';
import { isPromiseLike } from '@rxap/utilities';
import { Method } from '@rxap/pattern';

export const ACCORDION_DATA_SOURCE_METHOD = new InjectionToken('accordion-data-source-method');

@Injectable()
export abstract class AccordionDataSource<Data = unknown> extends BaseDataSource<Data> implements OnInit {

  public override _data$ = new ReplaySubject<Data>(1);
  public override readonly loading$ = new ToggleSubject(true);

  protected constructor(
    @Inject(ACCORDION_DATA_SOURCE_METHOD)
    protected readonly method: Method<Data, { parameters: { uuid: string } }>,
    protected readonly route: ActivatedRoute,
  ) {
    super();
  }

  protected _lastUuid: string | null = null;

  public get lastUuid(): string {
    if (!this._lastUuid) {
      throw new Error('The last accordion uuid is not yet defined');
    }
    return this._lastUuid;
  }

  protected _refresh$ = new Subject<void>();

  public get refresh$(): Observable<void> {
    return this._refresh$.asObservable();
  }

  public ngOnInit() {
    if (!this.route.snapshot.paramMap.has('uuid')) {
      throw new Error('Could not extract the accordion uuid from the route params');
    }
    this.route.paramMap.pipe(
      map(paramMap => paramMap.get('uuid')),
      isDefined(),
      tap(uuid => this._lastUuid = uuid),
      tap(uuid => this.load(uuid)),
    ).subscribe();
  }

  public override refresh(): any {
    const result = this.load(this.lastUuid);
    if (isPromiseLike(result)) {
      result.then(() => this._refresh$.next());
    } else {
      this._refresh$.next();
    }
  }

  protected async load(uuid: string): Promise<void> {
    this.loading$.enable();
    this.hasError$.disable();
    try {
      const result = await this.method
                               .call({ parameters: { uuid } });
      this._data$.next(result);
    } catch (error) {
      console.error(`Fail to load data '${ this.id }' - '${ this.constructor.name }'`);
      this.hasError$.enable();
    } finally {
      this.loading$.disable();
    }
  }

}
