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
  InjectionToken
} from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  DataSourceLoader,
  BaseDataSource,
  BaseDataSourceViewer,
  BaseDataSourceMetadata,
  PipeDataSource
} from '@rxap/data-source';
import { RxapFormControl } from '@rxap/forms';
import {
  Constructor,
  ControlOptions,
  ControlOption,
  Required
} from '@rxap/utilities';
import { Mixin } from '@rxap/mixin';
import { Subscription } from 'rxjs';
import {
  tap,
  map
} from 'rxjs/operators';
import { ExtractDataSourcesMixin } from '../mixins/extract-data-sources.mixin';
import { ExtractFormDefinitionMixin } from '../mixins/extract-form-definition.mixin';
import {
  UseDataSource,
  UseDataSourceSettings
} from '../decorators/use-data-source';

export interface InputSelectOptionsTemplateContext {
  $implicit: ControlOption;
}

export interface InputSelectOptionsSettings<Source> extends UseDataSourceSettings<Source, ControlOptions | Record<string, any>> {}


export const DATA_SOURCE_NAME = 'options';

export function ComposeOptionsTransformers(...fnc: Array<(value: any) => any>): (value: any) => any {
  return base => fnc.reduce((source, transform) => transform(source), base);
}

// tslint:disable-next-line:max-line-length
export function UseOptionsDataSource<Source>(
  dataSource: Constructor<BaseDataSource<Source>> | InjectionToken<BaseDataSource<Source>>,
  settings?: InputSelectOptionsSettings<Source>
): (
  target: any,
  propertyKey: string
) => any;
export function UseOptionsDataSource(
  dataSource: Constructor<BaseDataSource<ControlOptions>> | InjectionToken<BaseDataSource>,
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
export class InputSelectOptionsDirective implements OnInit, OnDestroy {

  @Input('rxapInputSelectOptionsViewer')
  public viewer: BaseDataSourceViewer = { id: '[rxapInputSelectOptions]' };

  @Input('rxapInputSelectOptionsMetadata')
  public metadata?: BaseDataSourceMetadata;

  protected readonly subscription = new Subscription();

  @Required
  protected control!: RxapFormControl;

  @Required
  protected dataSource!: BaseDataSource<ControlOptions | Record<string, any>>;

  @Required
  protected options!: ControlOptions | Record<string, any>;

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
    protected ngControl: NgControl | null = null
  ) { }

  protected extractControl(ngControl: NgControl | null = this.ngControl): RxapFormControl {

    if (!ngControl) {
      throw new Error('The ngControl is not defined!');
    }

    this.ngControl = ngControl;

    const control = this.ngControl.control;

    if (!(control instanceof RxapFormControl)) {
      throw new Error('Control is not a RxapFormControl!');
    }

    return this.control = control;
  }

  protected extractDatasource(control: RxapFormControl = this.control): BaseDataSource<ControlOptions | Record<string, any>> {
    const formDefinition = this.extractFormDefinition(control);

    const useDataSourceValueMap = this.extractDataSources(formDefinition, control.controlId);

    if (!useDataSourceValueMap.has(DATA_SOURCE_NAME)) {
      throw new Error(`The data source with the name 'options' is not defined`);
    }

    const useDataSourceValue = useDataSourceValueMap.get(DATA_SOURCE_NAME)!;

    let dataSource = this.dataSourceLoader.load(
      useDataSourceValue.dataSource,
      this.metadata,
      this.injector
    );

    const settings = useDataSourceValue.settings;

    if (settings?.transformer) {
      dataSource = new PipeDataSource(dataSource, map(settings.transformer));
    }

    return this.dataSource = dataSource;
  }

  public ngOnInit() {
    this.extractControl();
    this.extractDatasource();
    this.loadOptions();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private loadOptions(dataSource: BaseDataSource<ControlOptions | Record<string, any>> = this.dataSource) {
    this.subscription.add(dataSource.connect(this.viewer).pipe(
      tap(options => this.renderTemplate(this.options = options))
    ).subscribe());
  }

  protected renderTemplate(options: ControlOptions | Record<string, any> = this.options) {
    this.viewContainerRef.clear();

    if (!Array.isArray(options)) {

      for (const [ value, display ] of Object.entries(options)) {
        this.viewContainerRef.createEmbeddedView(this.template, { $implicit: { value, display } });
      }

    } else {

      for (const option of options) {
        this.viewContainerRef.createEmbeddedView(this.template, { $implicit: option });
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
