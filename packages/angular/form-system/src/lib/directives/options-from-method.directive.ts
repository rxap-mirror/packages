import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  inject,
  INJECTOR,
  Injector,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
  input
} from '@angular/core';
import {
  AbstractControlDirective,
  NgControl,
} from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { RxapFormControl } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import {
  ControlOption,
  ControlOptions,
} from '@rxap/utilities';
import {
  isObservable,
  Observable,
  Subscription,
  tap,
} from 'rxjs';
import {
  ExtractOptionsMethodMixin,
  OptionsMethod,
} from '../mixins/extract-options-method.mixin';


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
  exportAs: 'rxapOptionsFromMethod',
})
export class OptionsFromMethodDirective<Value = any, Parameters = any> implements AfterViewInit, OnChanges, OnDestroy {

  static ngTemplateContextGuard(
    dir: OptionsFromMethodDirective,
    ctx: any,
  ): ctx is OptionsFromMethodTemplateContext {
    return true;
  }

  readonly loading = signal<boolean>(true);

  public readonly parameters = input<Parameters>(undefined, { alias: "rxapOptionsFromMethodParameters" });

  public readonly resetOnChange = input<Value>(undefined, { alias: "rxapOptionsFromMethodResetOnChange" });

  public options: ControlOptions | null                                    = null;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly method = input.required<OptionsMethod<ControlOptions<Value>, Parameters>>({ alias: "rxapOptionsFromMethodCall" });
  protected ngControl: NgControl | AbstractControlDirective | null         = null;
  protected matFormField: MatFormField | null                              = null;
  protected settings: OptionsFromMethodDirectiveSettings                   = {};
  protected readonly viewContainerRef: ViewContainerRef                    = inject(ViewContainerRef);
  protected readonly injector: Injector                                    = inject(INJECTOR);
  protected readonly cdr: ChangeDetectorRef                                = inject(ChangeDetectorRef);
  private readonly template: TemplateRef<OptionsFromMethodTemplateContext> = inject(TemplateRef);

  protected _loadOptionsSubscription?: Subscription;

  public async ngAfterViewInit() {
    this.matFormField = this.injector.get(MatFormField, null);
    this.ngControl    = this.matFormField?._control.ngControl ?? this.injector.get(NgControl, null);
    this.control      = (this.ngControl?.control as RxapFormControl) ?? undefined;
    this.method() ??= this.extractOptionsMethod();
    // ensure that the options are loaded. It is possible that the ngOnChange is triggered before the ngAfterViewInit
    // then the options are not loaded.
    if (!this.options) {
      await this.load(this.parameters());
    }
  }

  ngOnDestroy() {
    this._loadOptionsSubscription?.unsubscribe();
  }

  public async ngOnChanges(changes: SimpleChanges) {
    // only try to load the options if the method is defined
    // else the initial load will be triggered in the ngAfterViewInit
    if (!this.method()) {
      console.debug('The method is not yet defined');
      return;
    }
    const parametersChanges = changes['parameters'];
    if (parametersChanges) {
      await this.load(parametersChanges.currentValue);
    }
  }

  protected async loadOptions(parameters?: Parameters): Promise<Observable<ControlOptions | null> | ControlOptions | null> {
    return this.method().call(parameters, this.control);
  }

  protected renderTemplate() {

    if (!this.options) {
      throw new Error('The options are not yet loaded');
    }

    this.viewContainerRef.clear();

    for (const option of this.options) {
      this.viewContainerRef.createEmbeddedView(this.template, {$implicit: option});
    }

    const resetOnChange = this.resetOnChange();
    if (resetOnChange !== undefined) {
      this.control?.reset(resetOnChange);
    }

    this.cdr.detectChanges();

  }

  protected setOptions(options: ControlOptions | null) {
    if (!options) {
      this.options = null;
      this.viewContainerRef.clear();
    } else {
      this.options = options.slice();
      this.renderTemplate();
    }
  }

  public async load(parameters: Parameters | undefined = this.parameters()) {
    this.loading.set(true);
    try {
      const result = await this.loadOptions(parameters);
      if (isObservable(result)) {
        this._loadOptionsSubscription?.unsubscribe();
        this._loadOptionsSubscription = result.pipe(
          tap(options => this.setOptions(options)),
        ).subscribe();
      } else {
        this.setOptions(result);
      }
    } finally {
      this.loading.set(false);
    }
  }

}


