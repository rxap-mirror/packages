import { TestBed } from '@angular/core/testing';
import { FormControlsComponent } from './form-controls.component';
import {
  Component,
  Injector,
  INJECTOR,
} from '@angular/core';
import {
  FormType,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormsModule,
  UseFormControl,
} from '@rxap/forms';

describe(FormControlsComponent.name, () => {

  interface ITestForm {
    username: string;
  }

  @RxapForm('test-form')
  class TestForm implements FormType<ITestForm> {
    @UseFormControl()
    username!: RxapFormControl<string>;
  }

  function FormFactory(
    injector: Injector,
  ): TestForm {
    return new RxapFormBuilder<ITestForm>(TestForm, injector).build({});
  }

  const FormProviders = [
    {
      provide: RXAP_FORM_DEFINITION,
      useFactory: FormFactory,
      deps: [ INJECTOR ],
    },
  ];

  beforeEach(() => {
    TestBed.overrideComponent(FormControlsComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {

    @Component({
      template: '<form rxapForm><rxap-form-controls></rxap-form-controls></form>',
      standalone: true,
      imports: [
        RxapFormsModule,
        FormControlsComponent,
      ],
      providers: [
        FormProviders,
      ],
    })
    class TestComponent {}

    cy.viewport(700, 300);
    cy.mount(TestComponent);
    cy.contains('button', 'Reset').should('exist');
    cy.contains('button', 'Cancel').should('exist');
    cy.contains('button', 'Submit').should('exist');
    cy.contains('button', 'Current Form State').should('exist');
  });
});
