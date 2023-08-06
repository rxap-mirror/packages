import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  Inject,
  Injector,
  INJECTOR,
  Input,
  isDevMode,
  OnDestroy,
  Optional,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  BaseDataSourceViewer,
  DataSourceLoader,
} from '@rxap/data-source';
import { RxapFormControl } from '@rxap/forms';
import {
  ControlOption,
  ControlOptions,
  equals,
  Required,
} from '@rxap/utilities';
import { Mixin } from '@rxap/mixin';
import {
  EMPTY,
  of,
  Subscription,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs/operators';
import {
  MAT_FORM_FIELD,
  MatFormField,
} from '@angular/material/form-field';
import { MatAutocomplete } from '@angular/material/autocomplete';
import {
  ExtractOptionsDataSourceMixin,
  UseOptionsDataSourceSettings,
} from '../mixins/extract-options-data-source.mixin';

export interface InputSelectOptionsTemplateContext {
  $implicit: ControlOption;
}

export interface InputSelectOptionsSettings<Source> extends UseOptionsDataSourceSettings<Source> {
  /**
   * true - the selected value is not send to the data source with the viewChange event.
   * Instead an empty object {} is send to trigger a data source refresh.
   *
   * The OpenApiDataSource expects a Paramters Object in the viewChange event. This
   * can couse issue if the select value object as a property that is also a parameter for
   * the open-api operation. For instaed the select object has the property company and
   * the open-api operation has a query parameter company. Then the BuildOptions method
   * in the OpenApiDataSource would create a HttpParams object with the param company and the
   * value from the select object property company. This will result in unpredictable behaviors.
   */
  ignoreSelectedValue?: boolean;

  /**
   * true - the options list is filtered by the current control value if the
   * control value is of type string. Then the display value of each option is
   * compared to the control value. If the display value of an option includes
   * the control value, then the option is used. This comprehensions it not type
   * sensitive
   */
  filteredOptions?: boolean;

  /**
   * true - the options list is only loaded once and not refreshed on each value change
   */
  loadOnce?: boolean;
}

export interface InputSelectOptionsDirective extends OnDestroy, AfterViewInit,
                                                     ExtractOptionsDataSourceMixin {
}

@Mixin(ExtractOptionsDataSourceMixin)
@Directive({
  selector: '[rxapInputSelectOptions]',
  standalone: true,
})
export class InputSelectOptionsDirective implements OnDestroy, AfterViewInit {

  @Input('rxapInputSelectOptionsViewer')
  public viewer: BaseDataSourceViewer = { id: '[rxapInputSelectOptions]' };

  @Input('rxapInputSelectOptionsMetadata')
  public metadata?: BaseDataSourceMetadata;

  @Input('rxapInputSelectOptionsMatAutocomplete')
  public matAutocomplete?: MatAutocomplete;

  protected readonly subscription = new Subscription();

  protected control!: RxapFormControl;

  protected dataSource!: BaseDataSource<ControlOptions | Record<string, any>>;

  protected options: ControlOptions | Record<string, any> | null = null;

  protected settings?: InputSelectOptionsSettings<any>;

  /**
   * This flag is used to prevent the setValue is called for each refresh
   * of the options list. This is needed because the setValue method will
   * trigger a new refresh of the options list. This results in an endless
   * call stack. This flag is set to true if the setValue method is called
   * once.
   */
  private isAutocompleteToDisplayTriggered = false;

  constructor(
    @Inject(TemplateRef)
    protected readonly template: TemplateRef<InputSelectOptionsTemplateContext>,
    @Inject(DataSourceLoader)
    protected readonly dataSourceLoader: DataSourceLoader,
    @Inject(ViewContainerRef)
    protected readonly viewContainerRef: ViewContainerRef,
    @Inject(INJECTOR)
    protected readonly injector: Injector,
    @Inject(ChangeDetectorRef)
    protected readonly cdr: ChangeDetectorRef,
    // The ngControl could be unknown on construction
    // bc it is available after the content is init
    @Optional()
    @Inject(NgControl)
    protected ngControl: NgControl | null = null,
    @Optional()
    @Inject(MAT_FORM_FIELD)
    protected matFormField: MatFormField | null = null,
  ) {
  }

  public ngAfterViewInit() {
    this.extractOptionsDatasource();
    this.viewer = {
      id: '[rxapInputSelectOptions]' + this.control.controlId,
      viewChange: this.settings?.loadOnce ? EMPTY : this.control.value$.pipe(
        throttleTime(1000),
        distinctUntilChanged((a, b) => equals(a, b)),
        map(value => {
          if (this.settings?.ignoreSelectedValue) {
            return {};
          }
          return value;
        }),
      ),
      control: this.control,
    };
    if (this.matAutocomplete) {
      this.matAutocomplete.displayWith = this.toDisplay.bind(this);
      this.settings ??= {};
      this.settings.filteredOptions ??= true;
    }
    this.loadOptions();
  }

  public toDisplay(value: any): string {
    if (!value) {
      return '';
    }
    return this.options?.find((option: any) => option.value === value)?.display ??
      (isDevMode() ? 'to display error' : '');
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private loadOptions(dataSource: BaseDataSource<ControlOptions | Record<string, any>> = this.dataSource) {
    this.subscription.add(dataSource.connect(this.viewer).pipe(
      switchMap(options => {
        if (this.settings?.filteredOptions) {
          return this.control.value$.pipe(
            map(controlValue => {
              if (typeof controlValue === 'string' && controlValue) {
                controlValue = controlValue.toLowerCase();
                if (Array.isArray(options)) {
                  return options.filter(option => option.display.toLowerCase().includes(controlValue));
                } else {
                  return Object.entries(options)
                               .filter(([ value, display ]) => typeof display ===
                                 'string' &&
                                 display.toLowerCase().includes(controlValue))
                               .map(([ value, display ]) => ({
                                 value,
                                 display,
                               }));
                }
              }
              return options;
            }),
          );
        }
        return of(options);
      }),
      tap(options => this.renderTemplate(this.options = options)),
      tap(() => {
        if (this.matAutocomplete && !this.isAutocompleteToDisplayTriggered) {
          this.isAutocompleteToDisplayTriggered = true;
          // trigger a change detection after the options are rendered
          // this is needed to trigger the mat-autocomplete options to display function
          this.ngControl?.control?.setValue(this.ngControl?.control?.value);
        }
      }),
    ).subscribe());
  }

  protected renderTemplate(options: ControlOptions | Record<string, any> | null = this.options) {
    this.viewContainerRef.clear();

    if (options) {
      if (!Array.isArray(options)) {

        for (const [ value, display ] of Object.entries(options)) {
          this.viewContainerRef.createEmbeddedView(
            this.template,
            {
              $implicit: {
                value,
                display,
              },
            },
          );
        }

      } else {

        for (const option of options) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: option });
        }

      }
    } else {
      if (isDevMode()) {
        console.warn(`The options for the control ${ this.control.fullControlPath } is empty/null/undefined!`);
      }
    }

    this.cdr.detectChanges();
  }

}


