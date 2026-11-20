import { ComponentFactoryResolver, ComponentRef, Directive, INJECTOR, Injector, OnInit, ViewContainerRef, input, inject } from '@angular/core';
import {
  Constructor,
  Required,
} from '@rxap/utilities';
import {
  ControlContainer,
  ControlValueAccessor,
} from '@angular/forms';
import { RxapFormSystemError } from './error';
import {
  FormDefinition,
  RxapFormControl,
} from '@rxap/forms';
import { FormSystemMetadataKeys } from './decorators/metadata-keys';
import { ControlWithDataSource } from './control-with-data-source';
import {
  DataSourceLoader,
  PipeDataSource,
} from '@rxap/data-source';
import { Mixin } from '@rxap/mixin';
import { ExtractDataSourcesMixin } from './mixins/extract-data-sources.mixin';
import { map } from 'rxjs/operators';
import { getMetadata } from '@rxap/reflect-metadata';

export interface FormSystemControlDirective<T> extends ExtractDataSourcesMixin, ControlValueAccessor, OnInit {
}

@Mixin(ExtractDataSourcesMixin)
@Directive({
  selector: '[rxapFormSystemControl]',
  standalone: true,
})
export class FormSystemControlDirective<T> implements ControlValueAccessor, OnInit {
  private readonly parent = inject<ControlContainer>(ControlContainer);
  private readonly cfr = inject<ComponentFactoryResolver>(ComponentFactoryResolver);
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  private readonly dataSourceLoader = inject<DataSourceLoader>(DataSourceLoader);
  private readonly injector = inject<Injector>(INJECTOR);


  /**
   * Defines the form control id
   */
  public readonly controlId = input.required<string>();

  protected control!: RxapFormControl;

  protected componentRef!: ComponentRef<ControlValueAccessor & Partial<ControlWithDataSource>>;

  public ngOnInit() {

    this.control = this.extractControl();

    const formDefinition = this.extractFormDefinition();

    this.componentRef = this.createComponent(formDefinition);

    this.setDataSources(formDefinition, this.componentRef.instance);
    this.setComponentProperties(formDefinition, this.componentRef.instance);

    this.viewContainerRef.insert(this.componentRef.hostView);

  }

  public registerOnChange(fn: (value: (any | null)) => void): void {
    this.componentRef.instance.registerOnChange(fn);
  }

  public registerOnTouched(fn: () => void): void {
    this.componentRef.instance.registerOnTouched(fn);
  }

  public writeValue(value: any): void {
    this.componentRef.instance.writeValue(value);
  }

  public setDisabledState(isDisabled: boolean): void {
    if (this.componentRef.instance.setDisabledState) {
      this.componentRef.instance.setDisabledState(isDisabled);
    }
  }

  private setDataSources(formDefinition: FormDefinition, component: Partial<ControlWithDataSource>): void {

    if (!component.setDataSource) {
      throw new RxapFormSystemError(
        'The ControlWithDataSource interface is not implemented for the control component, but the control has defined data sources',
        '',
      );
    }

    const useDataSourceValueMap = this.extractDataSources(formDefinition, this.controlId());

    for (const [ name, useDataSourceValue ] of useDataSourceValueMap.entries()) {

      let dataSource = this.dataSourceLoader.load(useDataSourceValue.dataSource);

      const settings = useDataSourceValue.settings;

      if (settings?.transformer) {
        dataSource = new PipeDataSource(dataSource, map(settings.transformer));
      }

      component.setDataSource(name, dataSource, useDataSourceValue.settings);

    }

  }

  private setComponentProperties(formDefinition: FormDefinition, component: any) {
    const componentProperties = this.extractComponentProperties(formDefinition);

    for (const [ key, value ] of Object.entries(componentProperties)) {
      Reflect.set(component, key, value);
    }

  }

  private createComponent(formDefinition: FormDefinition): ComponentRef<ControlValueAccessor> {
    const component = this.extractComponent(formDefinition);
    const componentFactory = this.cfr.resolveComponentFactory(component);
    return componentFactory.create(this.injector);
  }

  private extractControl(): RxapFormControl {
    if (!this.parent.control) {
      throw new RxapFormSystemError('The control property of ControlContainer is not defined', '');
    }

    const control = this.parent.control.get(this.controlId());

    if (!control) {
      throw new RxapFormSystemError('Could not find the control instance', '');
    }

    if (!(control instanceof RxapFormControl)) {
      throw new RxapFormSystemError('The extracted control is not a RxapFormControl', '');
    }

    return control;
  }

  private extractFormDefinition(): FormDefinition {
    const formDefinition = (this.control as any).rxapFormDefinition;

    if (!formDefinition) {
      throw new RxapFormSystemError('Could not find the form definition instance', '');
    }

    return formDefinition;
  }

  private extractComponent(formDefinition: FormDefinition): Constructor<ControlValueAccessor> {
    const map = getMetadata<Map<string, Constructor<ControlValueAccessor>>>(
      FormSystemMetadataKeys.COMPONENTS,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      throw new RxapFormSystemError('Could not extract the use component map from the form definition instance', '');
    }

    const controlId = this.controlId();
    if (!map.has(controlId)) {
      throw new RxapFormSystemError('A use component definition does not exists in the form definition metadata', '');
    }

    return map.get(controlId)!;
  }

  private extractComponentProperties(formDefinition: FormDefinition): Record<string, any> {
    const map = getMetadata<Map<string, Record<string, any>>>(
      FormSystemMetadataKeys.COMPONENTS_PROPERTIES,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      throw new RxapFormSystemError(
        'Could not extract the use component properties map from the form definition instance',
        '',
      );
    }

    const controlId = this.controlId();
    if (!map.has(controlId)) {
      throw new RxapFormSystemError('A use component definition does not exists in the form definition metadata', '');
    }

    return map.get(controlId)!;
  }

}
