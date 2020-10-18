import {
  Directive,
  TemplateRef,
  OnInit,
  Inject,
  ViewContainerRef,
  Input,
  OnDestroy,
  Injector,
  INJECTOR
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

// tslint:disable-next-line:max-line-length
export function UseOptionsDataSource<Source>(dataSource: Constructor<BaseDataSource<Source>>, settings?: InputSelectOptionsSettings<Source>): (
  target: any,
  propertyKey: string
) => any;
export function UseOptionsDataSource(dataSource: Constructor<BaseDataSource<ControlOptions>>, settings?: InputSelectOptionsSettings<ControlOptions>) {
  return function(target: any, propertyKey: string) {
    UseDataSource(dataSource, DATA_SOURCE_NAME, settings)(target, propertyKey);
  };
}

export interface InputSelectOptionsDirective extends OnInit,
                                                     ExtractFormDefinitionMixin,
                                                     ExtractDataSourcesMixin {}

@Mixin(ExtractFormDefinitionMixin, ExtractDataSourcesMixin)
@Directive({
  selector: '[rxapInputSelectOptions]',
})
export class InputSelectOptionsDirective implements OnInit, OnDestroy {

  @Input('rxapInputSelectOptionsViewer')
  public viewer: BaseDataSourceViewer = { id: '[rxapInputSelectOptions]' };

  @Input('rxapInputSelectOptionsMetadata')
  public metadata?: BaseDataSourceMetadata;

  private subscription?: Subscription;

  constructor(
    @Inject(NgControl)
    private readonly ngControl: NgControl,
    @Inject(TemplateRef)
    private readonly template: TemplateRef<InputSelectOptionsTemplateContext>,
    @Inject(DataSourceLoader)
    private readonly dataSourceLoader: DataSourceLoader,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(INJECTOR)
    private readonly injector: Injector,
  ) { }

  public ngOnInit() {

    const control = this.ngControl.control;

    if (!(control instanceof RxapFormControl)) {
      throw new Error('Control is not a RxapFormControl!');
    }

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

    this.readerTemplate(dataSource);

  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private readerTemplate(dataSource: BaseDataSource<ControlOptions | Record<string, any>>) {

    this.subscription = dataSource.connect(this.viewer).pipe(
      tap(options => {

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

      })
    ).subscribe();

  }

}
