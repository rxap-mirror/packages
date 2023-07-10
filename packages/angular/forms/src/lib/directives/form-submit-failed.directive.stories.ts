import {
  addDecorator,
  moduleMetadata,
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RxapFormsModule } from './forms.module';
import { FormDefinition } from '../model';
import { RxapFormGroup } from '../form-group';
import { RxapFormControl } from '../form-control';
import { UseFormControl } from '../decorators/use-form-control';
import { RxapForm } from '../decorators/form';
import { RxapFormBuilder } from '../form-builder';
import {
  RXAP_FORM_DEFINITION,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_SUBMIT_METHOD,
} from './tokens';
import {
  Injectable,
  INJECTOR,
  Injector,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormSubmitMethod } from './models';

@RxapForm('test')
class TestForm implements FormDefinition {

  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public name!: RxapFormControl;

}

@Injectable()
class FormSubmitFailMethod implements FormSubmitMethod<any> {

  public call(parameters: any): boolean | Promise<boolean> {
    throw new Error('submit failed');
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
      provide: RXAP_FORM_SUBMIT_METHOD,
      useClass: FormSubmitFailMethod,
    },
  ],
}));

export default {
  title: 'FormSubmitFailedDirective',
};

export const basic = () => ({
  template: `
<form rxapForm>

  <input formControlName="name">

  <button type="submit">Submit</button>

  <span *rxapFormSubmitFailed="let error">Form submit error: >>{{error.message}}<<</span>

</form>

  `,
});
