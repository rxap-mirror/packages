import {
  Directive,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { RXAP_TABLE_FILTER } from '@rxap/material-table-system';
import { Subscription } from 'rxjs';
import {
  debounceTime,
  tap
} from 'rxjs/operators';
import { TableFullTextSearchService } from './table-full-text-search.service';

@Directive({
  selector:   'input[ngModel][rxapTableFilterInput]',
  standalone: true
})
export class TableFilterInputDirective implements OnInit, OnDestroy {
  private _subscription?: Subscription;

  constructor(
    @Inject(NgModel)
    private readonly ngModel: NgModel,
    @Inject(RXAP_TABLE_FILTER)
    private readonly stringFilterService: TableFullTextSearchService
  ) {}

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngOnInit() {
    this._subscription = this.ngModel.valueChanges
                             ?.pipe(
                               debounceTime(128),
                               tap((value) =>
                                 this.stringFilterService.change.next(
                                   value && value.length >= 3 ? value : null
                                 )
                               )
                             )
                             .subscribe();
  }
}
