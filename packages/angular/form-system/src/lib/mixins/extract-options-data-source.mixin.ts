import {
  Injector,
  isDevMode,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  BaseDataSourceViewer,
  DataSourceLoader,
  PipeDataSource,
} from '@rxap/data-source';
import { IdOrInstanceOrToken } from '@rxap/definition';
import { RxapFormControl } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { ControlOptions } from '@rxap/utilities';
import {
  map,
  tap,
} from 'rxjs/operators';
import {
  UseDataSource,
  UseDataSourceSettings,
  UseDataSourceValue,
} from '../decorators/use-data-source';
import { InputSelectOptionsSettings } from '../directives/input-select-options.directive';
import { ExtractControlMixin } from './extract-control.mixin';
import { ExtractDataSourcesMixin } from './extract-data-sources.mixin';
import { ExtractFormDefinitionMixin } from './extract-form-definition.mixin';

export type UseOptionsDataSourceSettings<Source> = UseDataSourceSettings<Source, ControlOptions | Record<string, any>>

export const DATA_SOURCE_NAME = 'options';

export function ComposeOptionsTransformers(...fnc: Array<(value: any) => any>): (value: any) => any {
  return base => fnc.reduce((source, transform) => transform(source), base);
}

export function UseOptionsDataSource<Source>(
  dataSource: IdOrInstanceOrToken<BaseDataSource<Source>>,
  settings?: InputSelectOptionsSettings<Source>,
): (
  target: any,
  propertyKey: string,
) => any;
export function UseOptionsDataSource(
  dataSource: IdOrInstanceOrToken<BaseDataSource>,
  settings?: InputSelectOptionsSettings<ControlOptions>,
) {
  return function (target: any, propertyKey: string) {
    UseDataSource(dataSource, DATA_SOURCE_NAME, settings)(target, propertyKey);
  };
}

export interface ExtractOptionsDataSourceMixin extends ExtractFormDefinitionMixin, ExtractDataSourcesMixin,
                                                       ExtractControlMixin {
}

@Mixin(ExtractControlMixin, ExtractFormDefinitionMixin, ExtractDataSourcesMixin)
export class ExtractOptionsDataSourceMixin {

  protected settings?: UseOptionsDataSourceSettings<any>;

  protected readonly dataSourceLoader!: DataSourceLoader;

  public metadata?: BaseDataSourceMetadata;

  public viewer?: BaseDataSourceViewer;

  protected dataSource?: BaseDataSource<ControlOptions | Record<string, any>>;

  protected readonly injector!: Injector;

  protected useDataSourceValue?: UseDataSourceValue<ControlOptions | Record<string, any>>;

  protected extractOptionsDatasource(control?: AbstractControl): BaseDataSource<ControlOptions | Record<string, any>> {
    control ??= this.extractControl();

    if (!(control instanceof RxapFormControl)) {
      throw new Error('Ensure to use a RxapFromControl');
    }

    const formDefinition = this.extractFormDefinition(control);

    const useDataSourceValueMap = this.extractDataSources(formDefinition, control.controlId);

    if (!useDataSourceValueMap.has('options')) {
      throw new Error(`The data source with the name 'options' is not defined`);
    }

    const useDataSourceValue = this.useDataSourceValue = useDataSourceValueMap.get('options')!;

    this.settings = this.useDataSourceValue.settings ?? {};

    let dataSource: BaseDataSource;

    try {

      dataSource = this.dataSourceLoader.load(
        useDataSourceValue.dataSource,
        this.metadata,
        this.injector,
      );

    } catch (e: any) {

      if (e.name && e.name === 'NullInjectorError') {
        if (isDevMode()) {
          console.error('Cloud not inject the options data source', this.useDataSourceValue);
        }
        throw new Error('Cloud not inject the options data source:\n' + e.message);
      }

      throw e;

    }

    if (this.settings?.transformer) {
      dataSource = new PipeDataSource(
        dataSource,
        map(this.settings.transformer),
        tap(options => useDataSourceValue.lastValue = options),
      );
    } else {
      dataSource = new PipeDataSource(
        dataSource,
        tap(options => useDataSourceValue.lastValue = options),
      );
    }

    return this.dataSource = dataSource;
  }

}
