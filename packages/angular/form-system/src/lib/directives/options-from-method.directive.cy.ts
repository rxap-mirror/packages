import {
  Component,
  inject,
  Injectable,
  INJECTOR,
  Injector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  FormType,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormsModule,
  UseFormControl,
} from '@rxap/forms';
import { Method } from '@rxap/pattern';
import { ControlOptions } from '@rxap/utilities';
import { UseOptionsMethod } from '../mixins/extract-options-method.mixin';
import { OptionsFromMethodDirective } from './options-from-method.directive';

describe(OptionsFromMethodDirective.name, () => {

  @Injectable()
  class TestMethod implements Method<ControlOptions> {
    call(): ControlOptions {
      return [ {value: 'value', display: 'display'} ];
    }
  }

  interface ITestFormDefinition {
    name: string;
  }

  @RxapForm('test')
  class TestFormDefinition implements FormType<ITestFormDefinition> {

    @UseOptionsMethod(TestMethod)
    @UseFormControl()
    name!: RxapFormControl;

  }

  @Component({
    standalone: true,
    imports: [
      ReactiveFormsModule,
      RxapFormsModule,
      MatSelectModule,
      OptionsFromMethodDirective,
    ],
    providers: [
      TestFormDefinition,
      {
        provide: RXAP_FORM_DEFINITION,
        useFactory: (injector: Injector) => new RxapFormBuilder<ITestFormDefinition>(TestFormDefinition,
          injector).build(),
        deps: [ INJECTOR ],
      },
    ],
    template: `
      <form rxapForm>
        <mat-form-field>
          <mat-label>Name</mat-label>
          <mat-select formControlName="name">
            <mat-option *rxapOptionsFromMethod="let option; withoutParameters: true"
                        [value]="option.value">{{ option.display }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    `,
  })
  class TestComponent {

    method = inject(TestMethod);

  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule ],
      providers: [ TestMethod ],
    });
  });

  it('should create an instance', () => {
    cy.mount(TestComponent);
  });

  it('should be able to select an option', () => {
    cy.mount(TestComponent).then(response => {
      response.fixture.whenStable().then(() => {
        cy.matFormFieldByLabel('Name').matSelect().openMatSelect();
        cy.matOptionInOverlay('display').click();
        cy.matFormFieldByLabel('Name').matSelect().should('contain.text', 'display');
      });
    });
  });

});
