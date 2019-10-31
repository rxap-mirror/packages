import { RxapFormDefinition } from './form-definition/form-definition';
import {
  Subject,
  from,
  of
} from 'rxjs';
import {
  SubscriptionHandler,
  getMetadata,
  KeyValue
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './form-definition/decorators/meta-data-keys';
import {
  tap,
  filter
} from 'rxjs/operators';
import { OnValueChangeMetaData } from './form-definition/decorators/on-value-change';
import {
  ControlValidatorMetaData,
  ControlValidator
} from './form-definition/decorators/control-validator';
import { BaseForm } from './forms/base.form';
import { BaseFormControl } from './forms/form-controls/base.form-control';
import { BaseFormGroup } from './forms/form-groups/base.form-group';
import { BaseFormArray } from './forms/form-arrays/base.form-array';
import { FormInvalidSubmitService } from './form-invalid-submit.service';
import { FormValidSubmitService } from './form-valid-submit.service';
import { FormLoadService } from './form-load.service';

export enum FormInstanceSubscriptions {
  ON_VALUE_CHANGE   = 'on-value-change',
  CONTROL_VALIDATOR = 'control-validator'
}

export class FormInstance<FormValue extends object, FormDefinition extends RxapFormDefinition<FormValue> = RxapFormDefinition<FormValue>> {

  public static TestInstance<FormValue extends object>(formDefinition?: RxapFormDefinition<FormValue>) {
    return new FormInstance<FormValue>(formDefinition || RxapFormDefinition.TestInstance<FormValue>(), null, null, null);
  }

  public clickSubmit$ = new Subject<void>();
  public clickReset$  = new Subject<void>();

  public controlValidators = new Map<string, Array<ControlValidator<any>>>();

  protected _subscriptions = new SubscriptionHandler();

  constructor(
    public readonly formDefinition: FormDefinition,
    public readonly formInvalidSubmit: FormInvalidSubmitService<FormValue> | null = null,
    public readonly formValidSubmit: FormValidSubmitService<FormValue> | null     = null,
    public readonly formLoad: FormLoadService<FormValue> | null                   = null
  ) {}

  public rxapOnInit() {

    this.forEachForm(form => form.init());
    this.forEachForm(form => form.onInit$.next());
    this.forEachForm(form => form.rxapOnInit());

    this.formDefinition.init$.next();

    this._subscriptions.add(
      from(this.formLoad ? this.formLoad.onLoad(this) : of(true))
        .pipe(
          tap(() => {
            this.forEachFormDefinition((formDefinition) => this.handelOnValueChange(formDefinition));
            this.forEachFormDefinition((formDefinition) => this.handelControlValidators(formDefinition));
          })
        )
        .subscribe()
    );

  }

  public forEachForm(fnc: (form: BaseForm<any, any, any>) => void): void {
    function forEach(form: BaseForm<any, any, any>) {
      if (form instanceof BaseFormControl) {
        fnc(form);
      }
      if (form instanceof BaseFormGroup) {
        fnc(form);
        Array.from(form.controls.values()).forEach(control => forEach(control));
      }
      if (form instanceof BaseFormArray) {
        fnc(form);
        form.controls.forEach(control => forEach(control));
      }
    }

    forEach(this.formDefinition.group);
  }

  public forEachFormDefinition(fnc: (formDefinition: RxapFormDefinition<any>) => void): void {
    function forEach(form: BaseFormArray<any, any> | BaseFormGroup<any>) {
      if (form instanceof BaseFormArray) {
        form.controls
            .filter(control => control instanceof BaseFormGroup)
            .forEach(control => forEach(control as any));
      }
      if (form instanceof BaseFormGroup) {
        fnc(form.formDefinition);
      }
    }

    forEach(this.formDefinition.group);
  }

  public handelOnValueChange(formDefinition: RxapFormDefinition<any>) {
    const onValueChangeMetaData = getMetadata<OnValueChangeMetaData>(
      FormDefinitionMetaDataKeys.ON_VALUE_CHANGE,
      formDefinition.constructor.prototype
    ) || {};
    for (const [ controlId, propertyKeys ] of Object.entries(onValueChangeMetaData)) {
      const control = formDefinition
        .group
        .getControl(controlId);
      if (control) {
        this._subscriptions.add(
          FormInstanceSubscriptions.ON_VALUE_CHANGE,
          control
            .valueChange$
            .pipe(tap(() => propertyKeys.map(propertyKey => {
              const handler: () => void = (formDefinition as any as KeyValue<() => void>)[ propertyKey ];
              if (!(typeof handler === 'function')) {
                throw new Error(`Specifed on value change propertyKey '${propertyKey}' is not a function in definition '${formDefinition.group.controlId}'`);
              }
              return handler;
            }).forEach(handler => handler())))
            .subscribe()
        );
      } else {
        throw new Error(`Can not add on value change handler. Control with id '${controlId}' not found`);
      }
    }
  }

  public handelControlValidators(formDefinition: RxapFormDefinition<any>) {
    const controlValidatorMetaData = getMetadata<ControlValidatorMetaData>(FormDefinitionMetaDataKeys.CONTROL_VALIDATOR, formDefinition) || {};
    for (const [ controlId, cv ] of Object.entries(controlValidatorMetaData)) {
      const control = formDefinition
        .group
        .getControl(controlId);
      if (control) {
        const controlValidators: Array<ControlValidator<any>> = cv as any;
        this.controlValidators.set(control.controlPath, controlValidators);
        this._subscriptions.add(
          FormInstanceSubscriptions.CONTROL_VALIDATOR,
          control
            .valueChange$
            .pipe(
              filter(value => value !== null && value !== undefined),
              tap(value => controlValidators.forEach(controlValidator => this.runValidator(value, control, controlValidator)))
            )
            .subscribe()
        );
      } else {
        throw new Error(`Can not add control validator handler. Control with id '${controlId}' not found`);
      }
    }
  }

  public runValidators(): void {
    for (const [ controlPath, controlValidators ] of Object.entries(this.controlValidators.entries())) {
      const control = this.getControlByPath(controlPath);

      if (!control) {
        throw new Error(`Cloud not find control '${controlPath}'`);
      }

      for (const controlValidator of controlValidators) {
        this.runValidator(control.value, control, controlValidator);
      }
    }
  }

  public getControlByPath<Value>(controlPath: string): BaseForm<Value, any, any> | null {
    const fragments = controlPath.split('.');
    if (fragments.length < 1) {
      throw new Error('Control path is empty');
    }
    let form: BaseForm<any, any, any> | null = this.formDefinition.group;
    for (const fragment of fragments) {
      if (form instanceof BaseFormArray || form instanceof BaseFormGroup) {
        if (form.hasControl(fragment)) {
          form = (form.getControl as any)(fragment);
        } else {
          form = null;
          break;
        }
      }
    }

    if (form) {
      return form;
    }

    return null;
  }

  public submit() {
    this.clickSubmit$.next();
    this.formDefinition.rxapOnSubmit();
    this.runValidators();
    if (this.formDefinition.group.isValid === true) {
      this.formDefinition.rxapOnSubmitValid();
    } else if (this.formDefinition.group.isInvalid === true) {
      this.formDefinition.rxapOnSubmitInvalid();
    } else {
      this.formDefinition.rxapOnSubmitError();
    }
  }

  public rxapOnDestroy() {

    this.forEachForm(form => form.onDestroy$.next());
    this.forEachForm(form => form.rxapOnDestroy());

    this._subscriptions.resetAll();
  }

  private runValidator<Value>(value: Value, control: BaseForm<Value, any, any>, controlValidator: ControlValidator<Value>): void {
    const result = controlValidator.validator(value);
    const key    = controlValidator.key;
    if (key) {
      if (result !== null) {
        control.setError(key, controlValidator.message || result);
      } else {
        control.clearError(key);
      }
    } else {
      throw new Error('Control validator key is not defined');
    }
  }

  public reset() {
    this.clickReset$.next();
  }

}
