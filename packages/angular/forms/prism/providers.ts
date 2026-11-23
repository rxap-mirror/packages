import { INJECTOR, Injector, Provider } from '@angular/core';
import { Validators } from '@angular/forms';
import { RxapForm } from '../src/lib/decorators/form';
import { UseFormArrayGroup } from '../src/lib/decorators/use-form-array';
import { UseFormControl } from '../src/lib/decorators/use-form-control';
import { RXAP_FORM_DEFINITION_BUILDER, RXAP_FORM_SUBMIT_METHOD } from '../src/lib/directives/tokens';
import { RxapFormBuilder } from '../src/lib/form-builder';
import { RxapFormControl } from '../src/lib/form-control';
import { RxapFormGroup } from '../src/lib/form-group';

/**
 * Definition of the items of the `items` form array of the styleguide form.
 */
@RxapForm('prism-item')
export class PrismItemForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl({ validators: [ Validators.required ] })
  public label!: RxapFormControl<string>;
}

/**
 * The form definition used by every `<form rxapForm>` in the showcases of the form libraries.
 *
 * - `name`, `email` - text controls with an initial value
 * - `role` - a control with an object as value
 * - `items` - a form array with two form groups
 */
@RxapForm('prism-form')
export class PrismForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl({ state: 'Ada Lovelace', validators: [ Validators.required ] })
  public name!: RxapFormControl<string>;

  @UseFormControl({ state: 'ada@example.com', validators: [ Validators.required, Validators.email ] })
  public email!: RxapFormControl<string>;

  @UseFormControl({ state: { id: 1, label: 'Administrator' } })
  public role!: RxapFormControl<{ id: number; label: string }>;

  @UseFormArrayGroup(PrismItemForm, { state: [ { label: 'First item' }, { label: 'Second item' } ] })
  public items!: PrismItemForm[];
}

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 *
 * The builder (not the definition itself) is provided, so that every `<form rxapForm>` builds its own form instance.
 * The submit method resolves after a short delay. Submit the form with the name `fail` to reject it.
 */
export const PRISM_PROVIDERS: Provider[] = [
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: (injector: Injector) => new RxapFormBuilder<any, any>(PrismForm, injector),
    deps: [ INJECTOR ],
  },
  {
    provide: RXAP_FORM_SUBMIT_METHOD,
    useValue: {
      call: (value: { name?: string }) =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            if (value?.name === 'fail') {
              reject(new Error('The prism submit method rejected the form'));
            } else {
              resolve(value);
            }
          }, 800);
        }),
    },
  },
];
