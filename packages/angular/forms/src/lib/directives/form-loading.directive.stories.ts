import { Injectable, INJECTOR, Injector } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { addDecorator, moduleMetadata } from '@storybook/angular';
import { RxapForm } from '../decorators/form';
import { UseFormControl } from '../decorators/use-form-control';
import { RxapFormBuilder } from '../form-builder';
import { RxapFormControl } from '../form-control';
import { RxapFormGroup } from '../form-group';
import { FormDefinition } from '../model';
import { RxapFormsModule } from './forms.module';
import { FormLoadMethod } from './models';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_LOAD_METHOD,
} from './tokens';

@RxapForm('test')
class TestForm implements FormDefinition {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public name!: RxapFormControl;
}

@Injectable()
class FormInfiniteLoadingMethod implements FormLoadMethod {
  public call(): Promise<{ name: string }> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return new Promise<{ name: string }>(() => {});
  }
}

addDecorator(
  moduleMetadata({
    imports: [RxapFormsModule, BrowserAnimationsModule, ReactiveFormsModule],
    providers: [
      TestForm,
      {
        provide: RXAP_FORM_DEFINITION_BUILDER,
        useFactory: (injector: Injector) =>
          new RxapFormBuilder(TestForm, injector),
        deps: [INJECTOR],
      },
      {
        provide: RXAP_FORM_DEFINITION,
        useFactory: (builder: RxapFormBuilder) => builder.build(),
        deps: [RXAP_FORM_DEFINITION_BUILDER],
      },
      {
        provide: RXAP_FORM_LOAD_METHOD,
        useClass: FormInfiniteLoadingMethod,
      },
    ],
  }),
);

export default {
  title: 'FormLoadingDirective',
};

export const basic = () => ({
  template: `
<form rxapForm>

  <input formControlName="name">

  <button type="submit">Submit</button>

  <span *rxapFormLoading>Loading</span>

</form>

  `,
});
