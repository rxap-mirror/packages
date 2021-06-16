import {
  FormDirective,
  FormDefinition,
  FormDefinitionWithMetadata,
} from '@rxap/forms';
import {
  ChangeDetectorRef,
  Directive,
  forwardRef,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { TableFilterService } from './table-filter.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { RXAP_TABLE_FILTER_FORM_DEFINITION } from './tokens';
import { ControlContainer } from '@angular/forms';
import { equals } from '@rxap/utilities';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'table[rxap-filter-header-row]',
  providers: [
    {
      provide: ControlContainer,
      // ignore coverage
      useExisting: forwardRef(() => FilterHeaderRowDirective),
    },
  ],
})
export class FilterHeaderRowDirective
  extends FormDirective
  implements OnInit, OnDestroy
{
  private _subscription?: Subscription;

  constructor(
    private readonly tableFilter: TableFilterService,
    cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_TABLE_FILTER_FORM_DEFINITION)
    formDefinition: FormDefinitionWithMetadata | null
  ) {
    super(cdr, formDefinition);
  }

  public ngOnInit() {
    super.ngOnInit();
    this._subscription = this.form.value$
      .pipe(
        debounceTime(1000),
        map((values) =>
          Object.entries(values)
            .filter(
              ([key, value]) =>
                value !== null && value !== undefined && value !== ''
            )
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
        ),
        distinctUntilChanged((a, b) => equals(a, b))
      )
      .subscribe(this.tableFilter.change);
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    this._subscription?.unsubscribe();
  }
}
