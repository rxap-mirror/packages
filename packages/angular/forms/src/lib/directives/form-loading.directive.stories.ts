import {
  moduleMetadata,
  addDecorator,
} from '@storybook/angular';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RxapFormsModule} from './forms.module';
import {FormDefinition} from '../model';
import {RxapFormGroup} from '../form-group';
import {RxapFormControl} from '../form-control';
import {UseFormControl} from '../decorators/use-form-control';
import {RxapForm} from '../decorators/form';
import {RxapFormBuilder} from '../form-builder';
import {
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_DEFINITION,
  RXAP_FORM_LOAD_METHOD,
} from './tokens';
import {
  Injector,
  INJECTOR,
  Injectable,
} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FormLoadMethod} from './models';

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
    return new Promise<{ name: string }>(() => {
    });
  }

}

addDecorator(moduleMetadata({
  imports: [
    RxapFormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
  ],
  providers: [
    TestForm,
    {
      provide: RXAP_FORM_DEFINITION_BUILDER,
      useFactory: (injector: Injector) => new RxapFormBuilder(TestForm, injector),
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
}));

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
