import {
  Directive,
  TemplateRef,
  OnInit,
  Inject,
  ViewContainerRef,
  Input,
  OnDestroy,
  Injector,
  INJECTOR,
  Optional,
  ChangeDetectorRef,
  NgModule,
  isDevMode,
  AfterViewInit
} from '@angular/core';
import {
  NgControl,
  AbstractControlDirective
} from '@angular/forms';
import {
  DataSourceLoader,
  BaseDataSource,
  BaseDataSourceViewer,
  BaseDataSourceMetadata,
  PipeDataSource
} from '@rxap/data-source';
import { RxapFormControl } from '@rxap/forms';
import {
  ControlOptions,
  ControlOption,
  Required
} from '@rxap/utilities';
import { Mixin } from '@rxap/mixin';
import {
  Subscription,
  of
} from 'rxjs';
import {
  tap,
  map,
  switchMap
} from 'rxjs/operators';
import { ExtractDataSourcesMixin } from '../mixins/extract-data-sources.mixin';
import { ExtractFormDefinitionMixin } from '../mixins/extract-form-definition.mixin';
import {
  UseDataSource,
  UseDataSourceSettings
} from '../decorators/use-data-source';
import { IdOrInstanceOrToken } from '@rxap/definition';
import {
  MAT_FORM_FIELD,
  MatFormField
} from '@angular/material/form-field';
import { MatAutocomplete } from '@angular/material/autocomplete';

export interface InputSelectOptionsTemplateContext {
  $implicit: ControlOption;
}

export interface InputSelectOptionsSettings<Source> extends UseDataSourceSettings<Source, ControlOptions | Record<string, any>> {
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
}


export const DATA_SOURCE_NAME = 'options';

export function ComposeOptionsTransformers(...fnc: Array<(value: any) => any>): (value: any) => any {
  return base => fnc.reduce((source, transform) => transform(source), base);
}

// tslint:disable-next-line:max-line-length
export function UseOptionsDataSource<Source>(
  dataSource: IdOrInstanceOrToken<BaseDataSource<Source>>,
  settings?: InputSelectOptionsSettings<Source>
): (
  target: any,
  propertyKey: string
) => any;
export function UseOptionsDataSource(
  dataSource: IdOrInstanceOrToken<BaseDataSource>,
  settings?: InputSelectOptionsSettings<ControlOptions>
) {
  return function(target: any, propertyKey: string) {
    UseDataSource(dataSource, DATA_SOURCE_NAME, settings)(target, propertyKey);
  };
}

export interface InputSelectOptionsDirective extends OnInit,
                                                     ExtractFormDefinitionMixin,
                                                     ExtractDataSourcesMixin {}

@Mixin(ExtractFormDefinitionMixin, ExtractDataSourcesMixin)
@Directive({
  selector: '[rxapInputSelectOptions]'
})
export class InputSelectOptionsDirective implements OnDestroy, AfterViewInit {

  @Input('rxapInputSelectOptionsViewer')
  public viewer: BaseDataSourceViewer = { id: '[rxapInputSelectOptions]' };

  @Input('rxapInputSelectOptionsMetadata')
  public metadata?: BaseDataSourceMetadata;

  @Input('rxapInputSelectOptionsMatAutocomplete')
  public matAutocomplete?: MatAutocomplete;

  protected readonly subscription = new Subscription();

  @Required
  protected control!: RxapFormControl;

  @Required
  protected dataSource!: BaseDataSource<ControlOptions | Record<string, any>>;

  protected options: ControlOptions | Record<string, any> | null = null;

  protected settings?: InputSelectOptionsSettings<any>;

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
  ) { }

  public ngAfterViewInit() {
    this.extractControl();
    this.extractDatasource();
    this.viewer = {
      id: '[rxapInputSelectOptions]' + this.control.controlId,
      viewChange: this.control.value$.pipe(
        map(value => {
          if (this.settings?.ignoreSelectedValue) {
            return {}
          }
          return value;
        })
      ),
      control: this.control,
    }
    if (this.matAutocomplete) {
      this.matAutocomplete.displayWith = this.toDisplay.bind(this);
      this.settings ??= {};
      this.settings.filteredOptions ??= true;
    }
    this.loadOptions();
  }

  protected extractDatasource(control: RxapFormControl = this.control): BaseDataSource<ControlOptions | Record<string, any>> {
    const formDefinition = this.extractFormDefinition(control);

    const useDataSourceValueMap = this.extractDataSources(formDefinition, control.controlId);

    if (!useDataSourceValueMap.has(DATA_SOURCE_NAME)) {
      throw new Error(`The data source with the name 'options' is not defined`);
    }

    const useDataSourceValue = useDataSourceValueMap.get(DATA_SOURCE_NAME)!;

    this.settings = useDataSourceValue.settings ?? {};

    let dataSource: BaseDataSource;

    try {

      dataSource = this.dataSourceLoader.load(
        useDataSourceValue.dataSource,
        this.metadata,
        this.injector
      );

    } catch (e: any) {

      if (e.name && e.name === 'NullInjectorError') {
        if (isDevMode()) {
          console.error('Cloud not inject the options data source', useDataSourceValue);
        }
        throw new Error('Cloud not inject the options data source:\n' + e.message);
      }

      throw e;

    }

    if (this.settings?.transformer) {
      dataSource = new PipeDataSource(dataSource, map(this.settings.transformer));
    }

    return this.dataSource = dataSource;
  }

  public toDisplay(value: any): string {
    if (!value) {
      return '';
    }
    return this.options?.find((option: any) => option.value === value)?.display ?? (isDevMode() ? 'to display error' : '');
  }

  protected extractControl(ngControl: AbstractControlDirective | null = this.ngControl ?? this.matFormField?._control?.ngControl ?? null): RxapFormControl {

    if (!ngControl) {
      throw new Error('The ngControl is not defined!');
    }

    if (!(ngControl instanceof NgControl)) {
      throw new Error(`The control is not an instance of ngControl`);
    }

    this.ngControl = ngControl;

    const control = this.ngControl.control;

    if (!(control instanceof RxapFormControl)) {
      throw new Error('Control is not a RxapFormControl!');
    }

    return this.control = control;
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
                  return options.filter(option => option.display.toLowerCase().includes(controlValue))
                } else {
                  return Object.entries(options)
                               .filter(([value, display]) => typeof display === 'string' && display.toLowerCase().includes(controlValue))
                    .map(([value, display]) => ({ value, display }))
                }
              }
              return options;
            })
          );
        }
        return of(options);
      }),
      tap(options => this.renderTemplate(this.options = options))
    ).subscribe());
  }

  protected renderTemplate(options: ControlOptions | Record<string, any> | null = this.options) {
    this.viewContainerRef.clear();

    if (options) {
      if (!Array.isArray(options)) {

        for (const [ value, display ] of Object.entries(options)) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: { value, display } });
        }

      } else {

        for (const option of options) {
          this.viewContainerRef.createEmbeddedView(this.template, { $implicit: option });
        }

      }
    } else {
      if (isDevMode()) {
        console.warn(`The options for the control ${this.control.fullControlPath} is empty/null/undefined!`);
      }
    }

    this.cdr.detectChanges();
  }

}

@NgModule({
  declarations: [ InputSelectOptionsDirective ],
  exports:      [ InputSelectOptionsDirective ]
})
export class InputSelectOptionsDirectiveModule {}
