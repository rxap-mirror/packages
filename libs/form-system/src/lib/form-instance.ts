import { RxapFormDefinition } from './form-definition/form-definition';
import { Subject } from 'rxjs';
import {
  SubscriptionHandler,
  getMetadata
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './form-definition/decorators/meta-data-keys';
import {
  tap,
  filter
} from 'rxjs/operators';
import { OnValueChangeMetaData } from './form-definition/decorators/on-value-change';
import { ControlValidatorMetaData } from './form-definition/decorators/control-validator';

export enum FormInstanceSubscriptions {
  ON_VALUE_CHANGE   = 'on-value-change',
  CONTROL_VALIDATOR = 'control-validator'
}

export class FormInstance<FormValue extends object, FormDefinition extends RxapFormDefinition<FormValue> = RxapFormDefinition<FormValue>> {

  public static TestInstance<FormValue extends object>(formDefinition?: RxapFormDefinition<FormValue>) {
    return new FormInstance<FormValue>(formDefinition || RxapFormDefinition.TestInstance<FormValue>());
  }

  public clickSubmit$ = new Subject<void>();
  public clickReset$  = new Subject<void>();

  protected _subscriptions = new SubscriptionHandler();

  constructor(public readonly formDefinition: FormDefinition) {}

  public rxapOnInit() {
    this.formDefinition.init$.next();
    this.formDefinition.rxapOnInit();
    this.handelOnValueChange();
    this.handelControlValidators();
  }

  public handelOnValueChange() {
    const onValueChangeMetaData = getMetadata<OnValueChangeMetaData>(
      FormDefinitionMetaDataKeys.ON_VALUE_CHANGE,
      this.formDefinition.constructor.prototype
    ) || {};
    for (const [ controlId, propertyKeys ] of Object.entries(onValueChangeMetaData)) {
      this._subscriptions.add(
        FormInstanceSubscriptions.ON_VALUE_CHANGE,
        this.formDefinition
            .group
            .getControl(controlId)
            .valueChange$
            .pipe(tap(() => propertyKeys.forEach(propertyKey => {
              if (!(typeof this.formDefinition[ propertyKey ] === 'function')) {
                throw new Error(`Specifed on value change propertyKey '${propertyKey}' is not a function in definition '${this.formDefinition.group.controlId}'`);
              }
              this.formDefinition[ propertyKey ]();
            })))
            .subscribe()
      );
    }
  }

  public handelControlValidators() {
    const controlValidatorMetaData = getMetadata<ControlValidatorMetaData>(FormDefinitionMetaDataKeys.CONTROL_VALIDATOR, this.formDefinition) || {};
    for (const [ controlId, controlValidators ] of Object.entries(controlValidatorMetaData)) {
      const control = this.formDefinition
                          .group
                          .getControl(controlId);
      this._subscriptions.add(
        FormInstanceSubscriptions.CONTROL_VALIDATOR,
        control
          .valueChange$
          .pipe(
            filter(value => value !== null && value !== undefined),
            tap(value => controlValidators.forEach(controlValidator => {
              const result = controlValidator.validator(value);
              if (result !== null) {
                control.setError(controlValidator.key, controlValidator.message || result);
              } else {
                control.clearError(controlValidator.key);
              }
            }))
          )
          .subscribe()
      );
    }
  }

  public rxapOnDestroy() {
    this.formDefinition.destroy$.next();
    this.formDefinition.rxapOnDestroy();
    this._subscriptions.resetAll();
  }

  public submit() {
    this.clickSubmit$.next();
    this.formDefinition.rxapOnSubmit();
    if (this.formDefinition.group.isValid === true) {
      this.formDefinition.rxapOnSubmitValid();
    } else if (this.formDefinition.group.isInvalid === true) {
      this.formDefinition.rxapOnSubmitInvalid();
    } else {
      this.formDefinition.rxapOnSubmitError();
    }
  }

  public reset() {
    this.clickReset$.next();
  }

}
