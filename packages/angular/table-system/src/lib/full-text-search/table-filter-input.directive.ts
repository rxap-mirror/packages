import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgModel } from '@angular/forms';
import { RXAP_TABLE_FILTER } from '@rxap/material-table-system';
import {
  debounceTime,
  tap,
} from 'rxjs/operators';
import { TableFullTextSearchService } from './table-full-text-search.service';

@Directive({
  selector: 'input[ngModel][rxapTableFilterInput]',
  standalone: true,
})
export class TableFilterInputDirective {
  private readonly ngModel = inject<NgModel>(NgModel);
  private readonly stringFilterService = inject<TableFullTextSearchService>(RXAP_TABLE_FILTER);

  constructor() {
    this.ngModel.valueChanges
        ?.pipe(
          debounceTime(128),
          tap((value) =>
            this.stringFilterService.change.next(
              value && value.length >= 3 ? value : null,
            ),
          ),
          takeUntilDestroyed(inject(DestroyRef)),
        )
        .subscribe();
  }
}
