import { AfterViewInit, Directive, OnDestroy, input, inject } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  debounceTime,
  tap,
} from 'rxjs/operators';
import { RXAP_TABLE_FILTER } from '../table-data-source.directive';
import { TableColumnFilterService } from './table-column-filter.service';

// TODO : move to rxap packages
@Directive({
  selector: 'input[ngModel][rxapTableColumnFilterInput]',
  standalone: true,
})
export class TableColumnFilterInputDirective implements AfterViewInit, OnDestroy {
  private readonly ngModel = inject<NgModel>(NgModel);
  private readonly tableColumnFilterService = inject<TableColumnFilterService>(RXAP_TABLE_FILTER);


  public readonly column = input.required<string>();

  private _subscription?: Subscription;

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngAfterViewInit() {
    if (!this.ngModel.valueChanges) {
      throw new Error('Could not access the ngModel value change');
    }
    this._subscription = this.ngModel.valueChanges.pipe(
      debounceTime(500),
      tap((value) => {
          this.tableColumnFilterService.setFilter(this.column(), value);
        },
      ),
    )
    .subscribe();
  }


}


