import {
  Injector,
  StaticProvider,
  isDevMode
} from '@angular/core';
import {
  Constructor,
  getMetadata,
  assertIsObject,
  assertIsArray,
  assertIsFunction,
  HasRxapOnInitMethod
} from '@rxap/utilities';
import { MetadataKeys } from './decorators/metadata-keys';
import {
  AbstractControl,
  ValidatorFn,
  AsyncValidatorFn,
  Validators
} from '@angular/forms';
import {
  RxapAbstractControlOptions,
  RxapAbstractControlOptionsWithDefinition,
  ChangeFn,
  FormOptions,
  FormDefinition,
  FormDefinitionMetadata,
  SetValueFn
} from './model';
import { RxapFormArray } from './form-array';
import { RxapFormGroup } from './form-group';
import { RxapFormControl } from './form-control';
import { GetDefinitionMetadata } from '@rxap/definition';

export class FormArrayControlManager<T extends FormDefinition> {

  constructor(
    private readonly form: T,
    private readonly controlId: keyof T
  ) {}

  public inserted(index: number, controlOrDefinition: AbstractControl | FormDefinition): void {
    const controlContainer = this.form[ this.controlId ];
    if (Array.isArray(controlContainer)) {
      controlContainer.splice(index, 0, controlOrDefinition);
    } else {
      throw new Error('Could not register inserted control or definition. The control id does not points to an array of control or definition instance!');
    }
  }

  public removed(index: number): void {
    const controlContainer = this.form[ this.controlId ];
    if (Array.isArray(controlContainer)) {
      controlContainer.splice(index, 1);
    } else {
      throw new Error('Could not register inserted control or definition. The control id does not points to an array of control or definition instance!');
    }
  }

}

export class RxapFormBuilder<Form extends FormDefinition = FormDefinition> {

  private readonly formArrayGroups: Map<string, RxapAbstractControlOptionsWithDefinition>;
  private readonly formArrayControls: Map<string, RxapAbstractControlOptions>;
  private readonly formControls: Map<string, RxapAbstractControlOptions>;
  private readonly formGroups: Map<string, RxapAbstractControlOptionsWithDefinition>;
  private readonly formOptions: FormOptions;
  private readonly validators: Map<string, Set<string>>;
  private readonly asyncValidators: Map<string, Set<string>>;
  private readonly controlChanges: Map<string, Set<string>>;
  private readonly controlSetValue: Map<string, Set<string>>;

  private readonly providers: StaticProvider[];

  constructor(
    private readonly definition: Constructor<Form>,
    private readonly injector: Injector = Injector.NULL,
    providers: StaticProvider[]         = []
  ) {

    this.formArrayGroups   = this.extractArrayGroups();
    this.formArrayControls = this.extractArrayControls();
    this.formControls      = this.extractControls();
    this.formGroups        = this.extractGroups();
    this.validators        = this.extractValidators();
    this.asyncValidators   = this.extractAsyncValidators();
    this.controlChanges    = this.extractControlChanges();
    this.controlSetValue   = this.extractControlSetValue();
    const formOptions      = this.formOptions = this.extractFormOptions();

    // merge the providers from the from options with the providers from the
    // constructor. If the provider is defined in the form options and constructor
    // then the provider from the constructor will be used.
    this.providers = [ ...providers, ...(formOptions.providers ?? []) ].filter((provider: any, index, self) =>
      provider.hasOwnProperty('provide') &&
      self.findIndex((selfProvider: any) =>
      selfProvider.hasOwnProperty('provide') &&
      selfProvider.provide === provider.provide
      ) === index
    );

  }

  public build(state: Readonly<any> = {}, options: Partial<FormDefinitionMetadata & { controlId?: string }> = {}): Form {

    const injector = Injector.create({
      name:      `rxap/form-builder/${this.formOptions.id}`,
      parent:    this.injector,
      providers: this.providers
    });

    let form: Form & Record<string, Function>;


    // don't use the notFoundValue feature of the injector.
    // if used for each call of the get method an "empty" or "fallback"
    // instance is created

    try {
      form = injector.get(this.definition);
    } catch (e) {
      if (isDevMode()) {
        console.warn('Could not inject the definition instance. Fallback and call the constructor of the definition class.');
      }
      form = (new this.definition()) as Form & Record<string, Function>;
    }

    const controls: Record<string, AbstractControl> = {};

    this.buildControls(state, form, controls);
    this.buildGroups(state, form, controls);
    this.buildArrayGroups(state, form, controls);
    this.buildArrayControls(state, form, controls);

    const formOptions = {
      ...this.formOptions,
      controlId: options.controlId ?? (options.id ? options.id : this.formOptions.id),
      ...options
    };

    form.rxapFormGroup = new RxapFormGroup(controls, formOptions);

    Reflect.set(form.rxapFormGroup, '_rxapFormDefinition', form);

    if (HasRxapOnInitMethod(form)) {
      form.rxapOnInit();
    }

    return form;
  }

  private buildArrayControls(builderFormState: any, form: Form & Record<string, Function>, controls: Record<string, AbstractControl>): void {

    for (const [ controlId, options ] of this.formArrayControls.entries()) {

      const formState = this.coerceToControlFormState(
        controlId,
        [],
        builderFormState,
        options.state
      );

      assertIsArray(formState);

      const formControls: any = formState.map((fs, index) => new RxapFormControl(fs, { controlId: index.toFixed(0) }));

      const manager = new FormArrayControlManager(form, controlId);

      const formArray = formControls.rxapFormArray = controls[ controlId ] = new RxapFormArray(
        // TODO : add the formControlOptions property. To definition the form control options
        formControls,
        {
          ...options,
          controlId,
          validators:        [],
          asyncValidators:   [],
          controlInsertedFn: manager.inserted.bind(manager),
          controlRemovedFn:  manager.removed.bind(manager),
          builder:           (state, controlOptions) => new RxapFormControl(state, controlOptions)
        }
      );

      // TODO : add support for injectable validators

      formArray.setValidators(this.coerceToValidatorArray(form, options.validators, this.validators.get(controlId)), false);
      formArray.setAsyncValidators(this.coerceToValidatorArray(form, options.asyncValidators, this.asyncValidators.get(controlId)), false);

      Reflect.set(form, controlId, formControls);

    }

  }

  private buildArrayGroups(builderFormState: any, form: Form & Record<string, Function>, controls: Record<string, AbstractControl>): void {

    for (const [ controlId, options ] of this.formArrayGroups.entries()) {

      const formState = this.coerceToControlFormState(
        controlId,
        [],
        builderFormState,
        options.state
      );

      assertIsArray(formState);

      const formGroupBuilder = new RxapFormBuilder(
        options.definition,
        this.injector,
        this.providers
      );

      // TODO : add the formGroupOptions property. To definition of the form group options
      const formGroupDefinitions: any = formState.map((fs, index) => formGroupBuilder.build(fs, { id: index.toFixed(0) }));

      const manager = new FormArrayControlManager(form, controlId);

      const formArray = formGroupDefinitions.rxapFormArray = controls[ controlId ] = new RxapFormArray(
        formGroupDefinitions.map((fgd: FormDefinition) => fgd.rxapFormGroup),
        {
          ...options,
          builder:           formGroupBuilder.build.bind(formGroupBuilder),
          controlId,
          validators:        [],
          asyncValidators:   [],
          controlInsertedFn: manager.inserted.bind(manager),
          controlRemovedFn:  manager.removed.bind(manager)
        }
      );

      // TODO : add support for injectable validators

      formArray.setValidators(this.coerceToValidatorArray(form, options.validators, this.validators.get(controlId)), false);
      formArray.setAsyncValidators(this.coerceToValidatorArray(form, options.asyncValidators, this.asyncValidators.get(controlId)), false);

      Reflect.set(form, controlId, formGroupDefinitions);

    }

  }

  private buildGroups(builderFormState: any, form: Form & Record<string, Function>, controls: Record<string, AbstractControl>): void {

    for (const [ controlId, options ] of this.formGroups.entries()) {

      const formState = this.coerceToControlFormState(
        controlId,
        {},
        builderFormState,
        options.state
      );

      assertIsObject(formState);

      const formGroupDefinition: FormDefinition = new RxapFormBuilder(
        options.definition,
        this.injector,
        this.providers
      ).build(formState, {
        ...options,
        validators:      [],
        asyncValidators: []
      });

      controls[ controlId ] = formGroupDefinition.rxapFormGroup!;

      const formGroup = formGroupDefinition.rxapFormGroup;

      // TODO : add support for injectable validators

      formGroup.setValidators(this.coerceToValidatorArray(form, options.validators, this.validators.get(controlId)), false);
      formGroup.setAsyncValidators(this.coerceToValidatorArray(form, options.asyncValidators, this.asyncValidators.get(controlId)), false);

      // set the form group definition instance to the form definition instance
      Reflect.set(form, controlId, formGroupDefinition);

    }

  }

  private buildControls(builderFormState: any, form: Form & Record<string, Function>, controls: Record<string, AbstractControl>): void {

    for (const [ controlId, options ] of this.formControls.entries()) {

      const control = controls[ controlId ] = new RxapFormControl(
        this.coerceToControlFormState(
          controlId,
          null,
          builderFormState,
          options.state
        ),
        {
          ...options,
          controlId,
          validators:      [],
          asyncValidators: []
        }
      );

      const injectValidators: ValidatorFn[]           = [];
      const injectAsyncValidators: AsyncValidatorFn[] = [];

      for (const injectValidator of options.injectValidators ?? []) {
        const injectableValidator = this.injector.get(injectValidator);
        if (injectableValidator.validate) {
          injectValidators.push(injectableValidator.validate.bind(injectableValidator));
        }
        if (injectableValidator.asyncValidate) {
          injectAsyncValidators.push(injectableValidator.asyncValidate.bind(injectableValidator));
        }
      }

      control.setValidators(this.coerceToValidatorArray(
        form,
        options.validators,
        this.validators.get(controlId),
        injectValidators
      ), false);
      control.setAsyncValidators(this.coerceToValidatorArray(
        form,
        options.asyncValidators,
        this.asyncValidators.get(controlId),
        injectAsyncValidators
      ), false);

      // register all control on change function with the form control
      this.coerceToFnArray<ChangeFn>(form, this.controlChanges.get(controlId))
          .forEach(changeFn => control.registerOnChange(changeFn));

      // register all control on set value function with the form control
      this.coerceToFnArray<SetValueFn>(form, this.controlSetValue.get(controlId))
          .forEach(setValueFn => control.registerOnSetValue(setValueFn));

      if (Array.isArray(options.validators)) {
        if (options.validators.includes(Validators.required) || options.validators.includes(Validators.requiredTrue)) {
          Reflect.set(control, 'hasRequiredValidator', true);
        }
      }

      // set the form control instance to the form definition instance
      Reflect.set(form, controlId, control);

    }

  }

  /**
   * Coerce to a function array.
   *
   * @param form the current form definition instance
   * @param methodKeys A set of propertyKeys that points to form
   * definition instance methods
   */
  private coerceToFnArray<T extends Function>(form: Form & Record<string, Function>, methodKeys?: Set<string>): Array<T> {

    const changes: Array<T> = [];

    if (methodKeys) {

      methodKeys.forEach(propertyKey => {

        assertIsFunction(form[ propertyKey ]);

        changes.push((form[ propertyKey ] as T).bind(form));

      });

    }

    return changes;

  }

  /**
   * Coerce to a validator function array.
   *
   * @param form the current form definition instance
   * @param optionsValidators The options validator functions
   * @param validatorMethodKeys A set of propertyKeys that points to form
   * definition instance methods
   * @param injectValidators Injected validator functions
   */
  private coerceToValidatorArray<VF extends ValidatorFn | AsyncValidatorFn>(
    form: Form & Record<string, Function>,
    optionsValidators?: Array<VF> | VF | null,
    validatorMethodKeys?: Set<string>,
    injectValidators?: Array<VF>
  ): Array<VF> {

    const validators: Array<VF> = optionsValidators ? Array.isArray(optionsValidators) ? optionsValidators : [ optionsValidators ] : [];

    if (validatorMethodKeys) {

      validatorMethodKeys.forEach(propertyKey => {

        assertIsFunction(form[ propertyKey ]);

        validators.push((form[ propertyKey ]).bind(form) as VF);

      });

    }

    if (injectValidators) {
      validators.push(...injectValidators);
    }

    return validators;

  }

  /**
   * Coerce to the form state for the specified controlId. If none form state is
   * found the default form state will be returned.
   *
   * @param controlId A control id
   * @param defaultFormState The default form state
   * @param builderFormState The form state provides as build state parameter
   * @param optionsFormState The form state set by the decorator in the form definition
   */
  private coerceToControlFormState(
    controlId: string,
    defaultFormState: any,
    builderFormState: Record<string, any>,
    optionsFormState?: any
  ): any {

    let formState = defaultFormState;

    if (builderFormState && builderFormState[ controlId ] !== undefined) {
      formState = builderFormState[ controlId ];
    } else if (optionsFormState !== undefined) {
      formState = optionsFormState;
    }

    return formState;
  }

  private extractControlChanges(): Map<string, Set<string>> {
    return getMetadata(MetadataKeys.CONTROL_CHANGES, this.definition.prototype) ?? new Map<string, Set<string>>();
  }

  private extractControlSetValue(): Map<string, Set<string>> {
    return getMetadata(MetadataKeys.CONTROL_SET_VALUE, this.definition.prototype) ?? new Map<string, Set<string>>();
  }

  private extractValidators(): Map<string, Set<string>> {
    return getMetadata(MetadataKeys.CONTROL_VALIDATORS, this.definition.prototype) ?? new Map<string, Set<string>>();
  }

  private extractAsyncValidators(): Map<string, Set<string>> {
    return getMetadata(MetadataKeys.CONTROL_ASYNC_VALIDATORS, this.definition.prototype) ?? new Map<string, Set<string>>();
  }

  private extractArrayGroups(): Map<string, RxapAbstractControlOptionsWithDefinition> {
    return getMetadata(MetadataKeys.FORM_ARRAY_GROUPS, this.definition.prototype) ?? new Map<string, RxapAbstractControlOptionsWithDefinition>();
  }

  private extractArrayControls(): Map<string, RxapAbstractControlOptions> {
    return getMetadata(MetadataKeys.FORM_ARRAY_CONTROLS, this.definition.prototype) ?? new Map<string, RxapAbstractControlOptions>();
  }

  private extractGroups(): Map<string, RxapAbstractControlOptionsWithDefinition> {
    return getMetadata(MetadataKeys.FORM_GROUPS, this.definition.prototype) ?? new Map<string, RxapAbstractControlOptionsWithDefinition>();
  }

  private extractControls(): Map<string, RxapAbstractControlOptions> {
    return getMetadata(MetadataKeys.FORM_CONTROLS, this.definition.prototype) ?? new Map<string, RxapAbstractControlOptions>();
  }

  private extractFormOptions(): FormDefinitionMetadata {
    const options = GetDefinitionMetadata(this.definition);
    if (!options || !options.hasOwnProperty('id')) {
      throw new Error('Ensure that the @UseForm decorator is used.');
    }
    if (!options.providers) {
      options.providers = [];
    }
    return options;
  }
}
