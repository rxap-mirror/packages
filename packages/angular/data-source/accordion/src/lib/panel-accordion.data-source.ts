import {
  ACCORDION_DATA_SOURCE_METHOD,
  AccordionDataSource,
} from './accordion.data-source';
import {
  Inject,
  Injectable,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import '@rxap/rxjs';
import { ACCORDION_DATA_SOURCE } from './tokens';
import { Method } from '@rxap/pattern';

@Injectable()
export abstract class PanelAccordionDataSource<Data> extends AccordionDataSource<Data> implements OnDestroy {

  private _subscription?: Subscription;

  constructor(
    @Inject(ACCORDION_DATA_SOURCE_METHOD)
      method: Method<Data, { parameters: { uuid: string } }>,
    route: ActivatedRoute,
    @Inject(ACCORDION_DATA_SOURCE)
    protected readonly accordionDataSource: AccordionDataSource<unknown>,
  ) {
    super(method, route);
  }

  override ngOnInit() {
    super.ngOnInit();
    this._subscription = this.accordionDataSource.refresh$.pipe(
      tap(() => this.refresh()),
    ).subscribe();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._subscription?.unsubscribe();
  }

}
