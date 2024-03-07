import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  inject,
  INJECTOR,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { Mixin } from '@rxap/mixin';
import { Method } from '@rxap/pattern';
import {
  ControlOption,
  ControlOptions,
} from '@rxap/utilities';
import { ExtractOptionsMethodMixin } from '../mixins/extract-options-method.mixin';


export interface OptionsFromMethodTemplateContext {
  $implicit: ControlOption;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OptionsFromMethodDirectiveSettings {
}

// eslient-disable-next-line @typescript-eslint/no-empty-interface
export interface OptionsFromMethodDirective<Value = any, Parameters = any>
  extends AfterViewInit, OnChanges, ExtractOptionsMethodMixin {
}

@Mixin(ExtractOptionsMethodMixin)
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[rxapOptionsFromMethod]',
  standalone: true,
})
export class OptionsFromMethodDirective<Value = any, Parameters = any> implements AfterViewInit, OnChanges {

  static ngTemplateContextGuard(
    dir: OptionsFromMethodDirective,
    ctx: any,
  ): ctx is OptionsFromMethodTemplateContext {
    return true;
  }

  @Input('rxapOptionsFromMethodParameters')
  public parameters?: Parameters;

  @Input('rxapOptionsFromMethodResetOnChange')
  public resetOnChange?: Value;

  public options: ControlOptions | null                                          = null;
  protected ngControl: NgControl | null                                          = null;
  protected matFormField: MatFormField | null                                    = null;
  protected settings: OptionsFromMethodDirectiveSettings                         = {};
  protected method!: Method<ControlOptions, Parameters>;
  protected readonly viewContainerRef: ViewContainerRef                          = inject(ViewContainerRef);
  protected readonly injector: Injector                                          = inject(INJECTOR);
  protected readonly cdr: ChangeDetectorRef                                = inject(ChangeDetectorRef);
  private readonly template: TemplateRef<OptionsFromMethodTemplateContext> = inject(TemplateRef);

  public async ngAfterViewInit() {
    this.ngControl    = this.injector.get(NgControl, null);
    this.matFormField = this.injector.get(MatFormField, null);
    this.method       = this.extractOptionsMethod();
    // ensure that the options are loaded. It is possible that the ngOnChange is triggered before the ngAfterViewInit
    // then the options are not loaded.
    if (!this.options) {
      this.setOptions(await this.loadOptions(this.parameters));
    }
  }

  public async ngOnChanges(changes: SimpleChanges) {
    // only try to load the options if the method is defined
    // else the initial load will be triggered in the ngAfterViewInit
    if (!this.method) {
      console.debug('The method is not yet defined');
      return;
    }
    const parametersChanges = changes['parameters'];
    if (parametersChanges) {
      this.setOptions(await this.loadOptions(parametersChanges.currentValue));
    }
  }

  protected async loadOptions(parameters?: Parameters): Promise<ControlOptions> {
    return this.method.call(parameters);
  }

  protected renderTemplate() {

    if (!this.options) {
      throw new Error('The options are not yet loaded');
    }

    this.viewContainerRef.clear();

    for (const option of this.options) {
      this.viewContainerRef.createEmbeddedView(this.template, {$implicit: option});
    }

    if (this.resetOnChange !== undefined) {
      this.control?.reset(this.resetOnChange);
    }

    this.cdr.detectChanges();

  }

  protected setOptions(options: ControlOptions) {
    this.options = options.slice();
    this.renderTemplate();
  }

}


