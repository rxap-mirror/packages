import {
  AfterViewInit,
  Directive,
  inject,
  Injectable,
  Injector,
  INJECTOR,
  input,
  isDevMode,
  linkedSignal,
  OnDestroy,
  ProviderToken,
  untracked,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';
import { controlValueChanges$ } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { OpenApiRemoteMethodParameter } from '@rxap/open-api/remote-method';
import {
  Method,
  MethodWithParameters,
} from '@rxap/pattern';
import { isDefined } from '@rxap/rxjs';
import {
  ControlOption,
  ControlOptions,
} from '@rxap/utilities';
import { isUUID } from '@rxap/validator';
import {
  distinctUntilChanged,
  Observable,
  Subscription,
  tap,
} from 'rxjs';
import {
  ExtractIsValueFunctionMixin,
  UseIsValueFunction,
} from '../mixins/extract-is-value-function.mixin';
import { UseMethodConfig } from '../mixins/extract-methods.mixin';
import { UseOptionsMethod } from '../mixins/extract-options-method.mixin';
import {
  ExtractResolveMethodMixin,
  UseResolveMethod,
} from '../mixins/extract-resolve-method.mixin';
import {
  ExtractToDisplayFunctionMixin,
  UseToDisplayFunction,
} from '../mixins/extract-to-display-function.mixin';
import {
  AbstractOptionsFromMethodDirective,
  OptionsFromMethodDirectiveSettings,
} from './options-from-method.directive';
import { OptionsMethod } from '../mixins/extract-options-method.mixin';

export function UseAutocompleteOptionsMethod(
  method: ProviderToken<MethodWithParameters<ControlOptions, AutocompleteOptionsFromMethodDirectiveParameters>>,
): any;
export function UseAutocompleteOptionsMethod(
  method: ProviderToken<MethodWithParameters<ControlOptions, OpenApiRemoteMethodParameter<AutocompleteOptionsFromMethodDirectiveParameters>>>,
): any;
export function UseAutocompleteOptionsMethod(
  method: ProviderToken<MethodWithParameters>,
  config: UseMethodConfig<ControlOptions, AutocompleteOptionsFromMethodDirectiveParameters>,
): any;
export function UseAutocompleteOptionsMethod(
  method: ProviderToken<MethodWithParameters<ControlOptions, AutocompleteOptionsFromMethodDirectiveParameters | OpenApiRemoteMethodParameter<AutocompleteOptionsFromMethodDirectiveParameters>>>,
  config: UseMethodConfig = {},
) {
  config.adapter ??= {};
  config.adapter.parameter ??= (parameters) => ({parameters});
  return UseOptionsMethod(method as any, config);
}

export function UseAutocompleteResolveMethod<Value = unknown>(
  method: ProviderToken<MethodWithParameters<ControlOption<Value>, OpenApiRemoteMethodParameter<{ value: string }>>>,
  config: UseMethodConfig = {},
) {
  config.adapter ??= {};
  config.adapter.parameter ??= (parameters) => ({parameters});
  return UseResolveMethod(method, config);
}

export function UseAutocompleteIsValueFunction(
  isValue: (value: any) => boolean,
): any {
  return UseIsValueFunction(isValue);
}

export function UseAutocompleteToDisplayFunction(
  toDisplay: (value: any) => string,
): any {
  return UseToDisplayFunction(toDisplay);
}

export interface AutocompleteOptionsFromRemoteMethodTemplateContext {
  $implicit: ControlOption;
}

export interface AutocompleteOptionsFromMethodDirectiveSettings extends OptionsFromMethodDirectiveSettings {
  filteredOptions?: boolean;
}

export interface AutocompleteOptionsFromMethodDirectiveParameters<Value = any> {
  search?: Value | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AutocompleteOptionsFromMethodDirective<Value = any, Parameters extends AutocompleteOptionsFromMethodDirectiveParameters<Value> = AutocompleteOptionsFromMethodDirectiveParameters<Value>>
  extends ExtractResolveMethodMixin, ExtractIsValueFunctionMixin, ExtractToDisplayFunctionMixin, AfterViewInit, OnDestroy {
}

@Injectable({ providedIn: 'root' })
export class NoopResolveMethod<Value> implements Method<ControlOption, { value: Value }> {

  call({ value } : { value: Value }): Promise<ControlOption> {
    return Promise.resolve({ value, display: value + '' });
  }

}

@Mixin(ExtractResolveMethodMixin, ExtractIsValueFunctionMixin, ExtractToDisplayFunctionMixin)
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[rxapAutocompleteOptionsFromMethod]',
  standalone: true,
})
export class AutocompleteOptionsFromMethodDirective<Value = any, Parameters extends AutocompleteOptionsFromMethodDirectiveParameters<Value> = AutocompleteOptionsFromMethodDirectiveParameters<Value>>
  extends AbstractOptionsFromMethodDirective<Value, Parameters>
  implements AfterViewInit, OnDestroy {

  static override ngTemplateContextGuard(
    dir: AbstractOptionsFromMethodDirective,
    ctx: any,
  ): ctx is AutocompleteOptionsFromRemoteMethodTemplateContext {
    return true;
  }

  public readonly parameters = input<Parameters | undefined>(undefined, { alias: 'rxapAutocompleteOptionsFromMethodParameters' });
  public readonly resetOnChange = input<Value | undefined>(undefined, { alias: 'rxapAutocompleteOptionsFromMethodResetOnChange' });
  public readonly matAutocomplete = input<MatAutocomplete | undefined>(undefined, { alias: 'rxapAutocompleteOptionsFromMethodMatAutocomplete' });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly method = input<OptionsMethod<ControlOptions<Value>, Parameters> | undefined>(undefined, { alias: 'rxapAutocompleteOptionsFromMethodCall' });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly resolveMethod = input<MethodWithParameters<ControlOption, { value: Value } & Parameters> | undefined>(undefined, { alias: 'rxapAutocompleteOptionsFromMethodResolve' });

  public readonly isValue = input<((value: any) => boolean) | undefined>(undefined, { alias: 'rxapAutocompleteOptionsFromMethodIsValue' });

  public readonly toDisplay = input<((value: any) => string) | undefined>(undefined, { alias: 'rxapAutocompleteOptionsFromMethodToDisplay' });

  protected readonly resolvedResolveMethod = linkedSignal(() => this.resolveMethod());
  protected readonly resolvedIsValue = linkedSignal(() => this.isValue());
  protected readonly resolvedToDisplay = linkedSignal(() => this.toDisplay());

  protected override ngControl: NgControl | null                              = null;
  protected override matFormField: MatFormField | null                        = null;
  protected override injector: Injector                                       = inject(INJECTOR);
  protected override settings: AutocompleteOptionsFromMethodDirectiveSettings = {};
  /**
   * This flag is used to prevent the setValue is called for each refresh
   * of the options list. This is needed because the setValue method will
   * trigger a new refresh of the options list. This results in an endless
   * call stack. This flag is set to true if the setValue method is called
   * once.
   */
  private isAutocompleteToDisplayTriggered                                    = false;

  private _subscription?: Subscription;

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this._subscription?.unsubscribe();
  }

  public override ngAfterViewInit() {
    const matAutocomplete = this.matAutocomplete();
    if (matAutocomplete) {
      this.settings ??= {};
      this.settings.filteredOptions ??= true;
    }
    super.ngAfterViewInit();
    if (!this.resolvedResolveMethod()) {
      this.resolvedResolveMethod.set(this.extractResolveMethod());
    }
    if (!this.resolvedIsValue()) {
      this.resolvedIsValue.set(this.extractIsValueFunction((value: any) => typeof value === 'string' && isUUID(value)));
    }
    if (!this.resolvedToDisplay()) {
      this.resolvedToDisplay.set(this.extractToDisplayFunction((value: any): string => {
        if (!value) {
          return '';
        }
        const option = this.findOptionByValue(value);
        return option?.display ?? (isDevMode() ? 'to display error' : '...');
      }));
    }
    if (matAutocomplete) {
      matAutocomplete.displayWith = this.resolvedToDisplay()!.bind(this);
    }
    if (!this.control) {
      throw new Error('The control is not yet defined');
    }
    const value$       = controlValueChanges$(this.control);
    this._subscription = value$.pipe(
      isDefined(),
      // only trigger the load options or resolve value if the value is changed
      // this is required because in the resolveValue method the control value is set
      // to trigger the toDisplay function in the mat-autocomplete
      distinctUntilChanged(),
      tap(async value => {
        await this.load(untracked(this.parameters));
        if (this.resolvedIsValue()?.(value)) {
          this.triggerAutocompleteToDisplay();
        }
      }),
    ).subscribe();
  }

  protected override loadOptions(parameters: Parameters = {} as Parameters): Promise<ControlOptions | null | Observable<ControlOptions | null>> {
    if (!this.control) {
      throw new Error('The control is not yet defined');
    }
    const value        = this.control?.value;
    const c_parameters = {...parameters};
    if (this.resolvedIsValue()?.(value)) {
      return this.resolveValue(value, c_parameters);
    } else {
      c_parameters.search ??= value;
      if (!c_parameters.search) {
        return Promise.resolve([]);
      }
      return super.loadOptions(c_parameters);
    }
  }

  protected override renderTemplate() {
    super.renderTemplate();
    if (this.matAutocomplete() && !this.isAutocompleteToDisplayTriggered) {
      this.isAutocompleteToDisplayTriggered = true;
      this.triggerAutocompleteToDisplay();
    }
  }

  protected async resolveValue(value: Value, parameters: Parameters = {} as Parameters) {
    const resolveMethod = this.resolvedResolveMethod();
    if (!resolveMethod) {
      if (isDevMode()) {
        console.warn('The resolve method is not yet defined');
      }
      return null;
    }
    // only resolve the value if the option is not already loaded
    if (!this.findOptionByValue(value)) {
      const option = await resolveMethod!.call({...parameters, value});
      if (option.value !== value) {
        throw new Error('The resolved value is not the same as the input value');
      }
      return [ option ];
    }
    return this.options;
  }

  private triggerAutocompleteToDisplay() {
    // trigger a change detection after the options are rendered
    // this is needed to trigger the mat-autocomplete options to display function
    this.ngControl?.control?.setValue(this.ngControl?.control?.value);
  }

  private findOptionByValue(value: Value): ControlOption | null {
    return this.options?.find((option: ControlOption) => option.value === value) ?? null;
  }

}
