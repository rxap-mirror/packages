import {
  FormDefinition,
  FormDirective,
} from '@rxap/forms';
import {
  ChangeDetectorRef,
  Directive,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { TableFilterService } from './table-filter.service';
import { Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  tap,
} from 'rxjs/operators';
import { RXAP_TABLE_FILTER_FORM_DEFINITION } from './tokens';
import { ControlContainer } from '@angular/forms';
import { equals } from '@rxap/utilities';

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

  @Input('rxap-filter-header-row')
  public override set useFormDefinition(value: FormDefinition | '') {
    if (value) {
      this._formDefinition = value as any;
      this.form = value.rxapFormGroup;
    }
  }

  private _subscription?: Subscription;

  constructor(
    private readonly tableFilter: TableFilterService,
    cdr: ChangeDetectorRef,
    @Optional()
    @Inject(RXAP_TABLE_FILTER_FORM_DEFINITION)
      formDefinition: FormDefinition | null,
  ) {
    super(cdr, formDefinition);
  }

  public override ngOnInit() {
    super.ngOnInit();
    this._subscription = this.form.value$
                             .pipe(
                               debounceTime(1000),
                               distinctUntilChanged((a, b) => equals(a, b)),
                               tap(values => this.tableFilter.setMap(values)),
                             )
                             .subscribe();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this._subscription?.unsubscribe();
  }
}
