import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgModel } from '@angular/forms';
import { RXAP_TABLE_FILTER } from '@rxap/material-table-system';
import {
  debounceTime,
  tap,
} from 'rxjs/operators';
import { TableFullTextSearchService } from './table-full-text-search.service';
import { Showcase } from '@ng-prism/core';

@Showcase<TableFilterInputDirective>({
  title: 'Table Filter Input',
  category: 'Table System (Basic)',
  description: 'Sets the full text search value of the table filter service after the input value changed. A value shorter than three characters resets the filter.',
  status: 'stable',
  imports: [
    { name: 'FormsModule', from: '@angular/forms' },
    { name: 'MatFormFieldModule', from: '@angular/material/form-field' },
    { name: 'MatInputModule', from: '@angular/material/input' },
  ],
  host: { template: '<mat-form-field><mat-label>Search</mat-label><input matInput ngModel rxapTableFilterInput /></mat-form-field>' },
  variants: [
    { name: 'Default' },
  ],
})
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
