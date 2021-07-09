import {
  Directive,
  HostBinding,
  HostListener,
  Inject,
  INJECTOR,
  Injector,
  Input,
  isDevMode,
  NgModule,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import {
  coerceArray,
  ControlOptions
} from '@rxap/utilities';
import {
  MAT_FORM_FIELD,
  MatFormField
} from '@angular/material/form-field';
import {
  ExtractDataSourcesMixin,
  ExtractFormDefinitionMixin
} from '@rxap/form-system';
import { Mixin } from '@rxap/mixin';
import { RxapFormControl } from '@rxap/forms';
import {
  BaseDataSource,
  BaseDataSourceMetadata,
  DataSourceLoader,
  PipeDataSource
} from '@rxap/data-source';
import { map } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { WindowTableSelectOptions } from './window-table-select.service';
import { Method } from '@rxap/utilities/rxjs';

export interface ExtractDatasourceMixin extends ExtractFormDefinitionMixin, ExtractDataSourcesMixin {
}

@Mixin(ExtractFormDefinitionMixin, ExtractDataSourcesMixin)
export class ExtractDatasourceMixin {

  protected control!: RxapFormControl;
  protected injector!: Injector;
  protected dataSourceLoader!: DataSourceLoader;
  protected dataSource!: BaseDataSource<ControlOptions | Record<string, any>>;
  public metadata?: BaseDataSourceMetadata;

  // TODO : mv to rxap and replace in InputSelectOptionsDirective
  protected extractDatasource(
    dataSourceName: string,
    control: RxapFormControl = this.control
  ): BaseDataSource<ControlOptions | Record<string, any>> {

    const useDataSourceValue = this.extractDataSourceValue(dataSourceName, control);

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

  protected extractDataSourceValue(
    dataSourceName: string,
    control: RxapFormControl = this.control
  ) {
    const formDefinition = this.extractFormDefinition(control);

    const useDataSourceValueMap = this.extractDataSources(formDefinition, control.controlId);

    if (!useDataSourceValueMap.has(dataSourceName)) {
      throw new Error(`The data source with the name 'options' is not defined`);
    }

    return useDataSourceValueMap.get(dataSourceName)!;
  }

  protected extractDataSourceTransformer(
    dataSourceName: string,
    control: RxapFormControl = this.control
  ) {
    const useDataSourceValue = this.extractDataSourceValue(dataSourceName, control);
    const settings           = useDataSourceValue.settings;
    return settings?.transformer ?? (v => v);
  }

}


export interface OpenTableSelectDirective<Data extends Record<string, any>> extends ExtractDatasourceMixin {
}

@Mixin(ExtractDatasourceMixin)
@Directive({
  selector: '[rxapOpenTableSelect]'
})
export class OpenTableSelectDirective<Data extends Record<string, any>> implements OnInit {

  @HostBinding('type')
  public type = 'button';

  @Input('rxapOpenTableSelect')
  public openMethod!: Method<Data[], WindowTableSelectOptions<Data>>;

  private tableSelectDataSource!: BaseDataSource<Data[]>;

  constructor(
    @Inject(MAT_FORM_FIELD)
    private readonly formField: MatFormField,
    @Inject(DataSourceLoader)
    protected readonly dataSourceLoader: DataSourceLoader,
    @Inject(INJECTOR)
    protected readonly injector: Injector,
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef
  ) {
  }

  public ngOnInit() {
    const control = this.formField._control.ngControl?.control;

    if (!control) {
      throw new Error('Could not extract the control from the form field');
    }

    if (!(control instanceof RxapFormControl)) {
      throw new Error('The control is not an instance of RxapFormControl');
    }

    this.extractDatasource('options', this.control = control);

    this.tableSelectDataSource = new PipeDataSource(this.dataSource, map(source => {

      if (!Array.isArray(source)) {
        throw new Error('Only control options data source are supported as source data source for a select table');
      }

      return source.map(item => item.value);
    }));

  }

  @HostListener('click')
  public async onClick() {

    const selected = await this.openMethod.call({
      data:             this.tableSelectDataSource,
      selected:         coerceArray(this.control.value),
      multiple:         this.isMultiple(),
      injector:         this.injector,
      viewContainerRef: this.viewContainerRef
    });
    if (isDevMode()) {
      console.log('table select returns', selected);
    }
    if (selected && Array.isArray(selected)) {
      if (this.isMultiple()) {
        this.control.setValue(selected);
      } else {
        this.control.setValue(selected[ 0 ] ?? null);
      }
    }
  }

  private isMultiple(): boolean {

    const formFieldControl = this.formField._control;

    if (formFieldControl instanceof MatSelect) {
      return formFieldControl.multiple;
    }

    return false;
  }

}

@NgModule({
  declarations: [ OpenTableSelectDirective ],
  exports:      [ OpenTableSelectDirective ]
})
export class OpenTableSelectDirectiveModule {
}
