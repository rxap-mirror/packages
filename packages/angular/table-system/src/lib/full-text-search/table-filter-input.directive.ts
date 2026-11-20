import { Directive, OnDestroy, OnInit, inject } from '@angular/core';
import { NgModel } from '@angular/forms';
import { RXAP_TABLE_FILTER } from '@rxap/material-table-system';
import { Subscription } from 'rxjs';
import {
  debounceTime,
  tap,
} from 'rxjs/operators';
import { TableFullTextSearchService } from './table-full-text-search.service';

@Directive({
  selector: 'input[ngModel][rxapTableFilterInput]',
  standalone: true,
})
export class TableFilterInputDirective implements OnInit, OnDestroy {
  private readonly ngModel = inject<NgModel>(NgModel);
  private readonly stringFilterService = inject<TableFullTextSearchService>(RXAP_TABLE_FILTER);

  private _subscription?: Subscription;

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngOnInit() {
    this._subscription = this.ngModel.valueChanges
                             ?.pipe(
                               debounceTime(128),
                               tap((value) =>
                                 this.stringFilterService.change.next(
                                   value && value.length >= 3 ? value : null,
                                 ),
                               ),
                             )
                             .subscribe();
  }
}
