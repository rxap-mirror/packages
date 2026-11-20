import { Directive, forwardRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import {
  FormDefinition,
  FormDirective,
} from '@rxap/forms';
import { equals } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  tap,
} from 'rxjs/operators';
import { TableFilterService } from './table-filter.service';
import { RXAP_TABLE_FILTER_FORM_DEFINITION } from './tokens';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'table[rxap-filter-header-row]',
  providers: [
    {
      provide: ControlContainer,
      // ignore coverage
      useExisting: forwardRef(() => FilterHeaderRowDirective),
    },
  ],
  standalone: true,
})
export class FilterHeaderRowDirective
  extends FormDirective
  implements OnInit, OnDestroy {
  private readonly tableFilter = inject(TableFilterService);

  /**
   * Optional form definition bound with the selector attribute. Falls back to RXAP_TABLE_FILTER_FORM_DEFINITION.
   */
  public readonly filterFormDefinition = input<FormDefinition | ''>('', { alias: 'rxap-filter-header-row' });

  private _subscription?: Subscription;

  constructor() {
    super();
    const formDefinition = inject<FormDefinition | null>(RXAP_TABLE_FILTER_FORM_DEFINITION, { optional: true });
    if (formDefinition) {
      this._formDefinition = formDefinition as any;
      this.form = formDefinition.rxapFormGroup as any;
    }
  }

  public override ngOnInit() {
    const formDefinition = this.filterFormDefinition();
    if (formDefinition) {
      this._formDefinition = formDefinition as any;
      this.form = formDefinition.rxapFormGroup as any;
    }
    super.ngOnInit();
    this._subscription = new Subscription();
    this._subscription.add(this.tableFilter.reset$.subscribe(() => this.form.reset()));
    this._subscription.add(this.form.value$
                             .pipe(
                               debounceTime(1000),
                               distinctUntilChanged((a, b) => equals(a, b)),
                               tap(values => this.tableFilter.setMap(values)),
                             )
                             .subscribe());
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this._subscription?.unsubscribe();
  }
}
