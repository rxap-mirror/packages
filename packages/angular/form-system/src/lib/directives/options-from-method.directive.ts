import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  effect,
  inject,
  INJECTOR,
  Injector,
  input,
  linkedSignal,
  OnDestroy,
  Signal,
  signal,
  TemplateRef,
  untracked,
  ViewContainerRef,
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AbstractOptionsFromMethodDirective<Value = any, Parameters = any>
  extends AfterViewInit, ExtractOptionsMethodMixin {
}

/**
 * Shared implementation of the options from method directives. The concrete directives
 * only declare the (aliased) signal inputs.
 */
@Mixin(ExtractOptionsMethodMixin)
@Directive()
export abstract class AbstractOptionsFromMethodDirective<Value = any, Parameters = any> implements AfterViewInit, OnDestroy {

  static ngTemplateContextGuard(
    dir: AbstractOptionsFromMethodDirective,
    ctx: any,
  ): ctx is OptionsFromMethodTemplateContext {
    return true;
  }

  readonly loading = signal<boolean>(true);

  public abstract readonly parameters: Signal<Parameters | undefined>;

  public abstract readonly resetOnChange: Signal<Value | undefined>;

  public abstract readonly method: Signal<OptionsMethod<ControlOptions<Value>, Parameters> | undefined>;

  /**
   * The method used to load the options. Defaults to the method defined with the input. If the
   * input is not set the method is extracted from the form definition.
   */
  protected readonly optionsMethod = linkedSignal<OptionsMethod<ControlOptions<Value>, Parameters> | undefined>(() => this.method());

  public options: ControlOptions | null                                    = null;
  protected ngControl: NgControl | AbstractControlDirective | null         = null;
  protected matFormField: MatFormField | null                              = null;
  protected settings: OptionsFromMethodDirectiveSettings                   = {};
  protected readonly viewContainerRef: ViewContainerRef                    = inject(ViewContainerRef);
  protected injector: Injector                                             = inject(INJECTOR);
  protected readonly cdr: ChangeDetectorRef                                = inject(ChangeDetectorRef);
  private readonly template: TemplateRef<OptionsFromMethodTemplateContext> = inject(TemplateRef);

  protected readonly initialized = signal(false);

  protected _loadOptionsSubscription?: Subscription;

  constructor() {
    // load the options as soon as the directive is initialized and each time the parameters change
    effect(() => {
      const parameters = this.parameters();
      if (!this.initialized()) {
        return;
      }
      untracked(() => this.load(parameters));
    });
  }

  public ngAfterViewInit() {
    this.matFormField = this.injector.get(MatFormField, null);
    this.ngControl    = this.matFormField?._control.ngControl ?? this.injector.get(NgControl, null);
    this.control      = (this.ngControl?.control as RxapFormControl) ?? undefined;
    if (!this.optionsMethod()) {
      this.optionsMethod.set(this.extractOptionsMethod());
    }
    this.initialized.set(true);
  }

  ngOnDestroy() {
    this._loadOptionsSubscription?.unsubscribe();
  }

  protected async loadOptions(parameters?: Parameters): Promise<Observable<ControlOptions | null> | ControlOptions | null> {
    return this.optionsMethod()!.call(parameters, this.control);
  }

  protected renderTemplate() {

    if (!this.options) {
      throw new Error('The options are not yet loaded');
    }

    this.viewContainerRef.clear();

    for (const option of this.options) {
      this.viewContainerRef.createEmbeddedView(this.template, {$implicit: option});
    }

    const resetOnChange = untracked(this.resetOnChange);
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

  public async load(parameters: Parameters | undefined = untracked(this.parameters)) {
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

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[rxapOptionsFromMethod]',
  standalone: true,
  exportAs: 'rxapOptionsFromMethod',
})
export class OptionsFromMethodDirective<Value = any, Parameters = any> extends AbstractOptionsFromMethodDirective<Value, Parameters> {

  public readonly parameters = input<Parameters | undefined>(undefined, { alias: 'rxapOptionsFromMethodParameters' });

  public readonly resetOnChange = input<Value | undefined>(undefined, { alias: 'rxapOptionsFromMethodResetOnChange' });

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly method = input<OptionsMethod<ControlOptions<Value>, Parameters> | undefined>(undefined, { alias: 'rxapOptionsFromMethodCall' });

}
