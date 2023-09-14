import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RxapForm } from './decorators/form';
import { UseFormControl } from './decorators/use-form-control';
import { RxapFormsModule } from './directives/forms.module';
import { RXAP_FORM_DEFINITION } from './directives/tokens';
import { RxapFormBuilder } from './form-builder';
import { RxapFormControl } from './form-control';
import { FormType } from './model';

describe('FormControl', () => {

  it('should be disabled if the disabled option is set', () => {

    interface ITestForm {
      username: string;
    }

    @RxapForm('test')
    class TestForm implements FormType<ITestForm> {

      @UseFormControl({ disabled: true })
      username!: RxapFormControl<string>;

    }

    const builder = new RxapFormBuilder<ITestForm>(TestForm);

    const form = builder.build() as FormType<ITestForm>;

    @Component({
      template: `
        <form rxapForm><input formControlName="username"></form>`,
      standalone: true,
      imports: [ RxapFormsModule, ReactiveFormsModule ],
      providers: [
        {
          provide: RXAP_FORM_DEFINITION,
          useValue: form,
        },
      ],
    })
    class TestComponent {}

    cy.mount(TestComponent).then(response => {
      response.fixture.whenStable().then(() => {

        cy.get('input').should('be.disabled');

      });
    });

  });

});
