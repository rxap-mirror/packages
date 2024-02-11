import {
  inject,
  Injectable,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import '@rxap/rxjs';
import { AccordionDataSource } from './accordion.data-source';
import { ACCORDION_DATA_SOURCE } from './tokens';

@Injectable()
export abstract class PanelAccordionDataSource<
  Data = unknown,
  Parameters = unknown
> extends AccordionDataSource<Data, Parameters> implements OnDestroy, OnInit {

  protected readonly accordionDataSource = inject<AccordionDataSource<Data, Parameters>>(ACCORDION_DATA_SOURCE);

  override getParameters(): Observable<Parameters> | Promise<Parameters> | Parameters {
    return this.accordionDataSource.getParameters();
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
