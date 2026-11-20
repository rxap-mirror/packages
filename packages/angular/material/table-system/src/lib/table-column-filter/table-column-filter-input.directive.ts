import { afterNextRender, DestroyRef, Directive, input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgModel } from '@angular/forms';
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
export class TableColumnFilterInputDirective {
  private readonly ngModel = inject<NgModel>(NgModel);
  private readonly tableColumnFilterService = inject<TableColumnFilterService>(RXAP_TABLE_FILTER);
  private readonly destroyRef = inject(DestroyRef);

  public readonly column = input.required<string>();

  constructor() {
    afterNextRender(() => {
      if (!this.ngModel.valueChanges) {
        throw new Error('Could not access the ngModel value change');
      }
      this.ngModel.valueChanges.pipe(
        debounceTime(500),
        tap((value) => this.tableColumnFilterService.setFilter(this.column(), value)),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
    });
  }

}
