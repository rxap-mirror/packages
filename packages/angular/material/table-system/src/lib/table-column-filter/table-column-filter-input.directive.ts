import { afterNextRender, DestroyRef, Directive, input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgModel } from '@angular/forms';
import {
  debounceTime,
  tap,
} from 'rxjs/operators';
import { RXAP_TABLE_FILTER } from '../table-data-source.directive';
import { TableColumnFilterService } from './table-column-filter.service';
import { Showcase } from '@ng-prism/core';

// TODO : move to rxap packages

@Showcase<TableColumnFilterInputDirective>({
  title: 'Table Column Filter Input',
  category: 'Table System',
  description: 'Sets the filter value of a column in the `TableColumnFilterService` after the input value changed.',
  status: 'stable',
  imports: [
    { name: 'FormsModule', from: '@angular/forms' },
    { name: 'MatFormFieldModule', from: '@angular/material/form-field' },
    { name: 'MatInputModule', from: '@angular/material/input' },
  ],
  host: { template: '<mat-form-field><mat-label>Filter</mat-label><input matInput ngModel rxapTableColumnFilterInput /></mat-form-field>' },
  variants: [
    { name: 'Name column', inputs: { column: 'name' } },
    { name: 'E-Mail column', inputs: { column: 'email' } },
  ],
})
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
