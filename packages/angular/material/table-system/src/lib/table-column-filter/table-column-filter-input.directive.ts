import {
  AfterViewInit,
  Directive,
  Inject,
  Input,
  OnDestroy,
} from '@angular/core';
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

  @Input({required: true})
  public column!: string;

  private _subscription?: Subscription;

  constructor(
    @Inject(NgModel)
    private readonly ngModel: NgModel,
    @Inject(RXAP_TABLE_FILTER)
    private readonly tableColumnFilterService: TableColumnFilterService,
  ) {
  }

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
          this.tableColumnFilterService.setFilter(this.column, value);
        },
      ),
    )
    .subscribe();
  }


}


