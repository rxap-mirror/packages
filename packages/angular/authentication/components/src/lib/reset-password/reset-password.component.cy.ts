import { TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { AuthenticationContainerComponent } from '../authentication-container/authentication-container.component';

describe(ResetPasswordComponent.name, () => {

  @Component({
    template: `
        <rxap-authentication-container>
            <rxap-reset-password></rxap-reset-password>
        </rxap-authentication-container>
    `, standalone: true, imports: [
      AuthenticationContainerComponent, ResetPasswordComponent,
    ],
  })
  class TestComponent {}

  beforeEach(() => {
    TestBed.overrideComponent(TestComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(TestComponent, {
      imports: [ NoopAnimationsModule, RouterTestingModule ],
    });
  });

  it('should show error message if passwords are empty', () => {

    cy.mount(TestComponent, {
      imports: [ NoopAnimationsModule, RouterTestingModule ],
    });
    cy.contains('button', 'Reset password').click();
    cy.get('.password-input mat-error').should('contain.text', 'Password is required');

  });

  it('should show error message if passwords are not equal', () => {

    cy.mount(TestComponent, {
      imports: [ NoopAnimationsModule, RouterTestingModule ],
    });
    cy.wait(2500);
    cy.matFormField('password').matType('password');
    cy.matFormField('passwordRepeat').matType('password2');
    cy.contains('button', 'Reset password').click();
    cy.get('mat-error').should('contain.text', 'Entered password are not equal');

  });

  it('should show error if password reset failed', () => {

    cy.mount(TestComponent, {
      imports: [ NoopAnimationsModule, RouterTestingModule ],
    });
    cy.wait(2500);
    cy.matFormField('password').matType('fail');
    cy.matFormField('passwordRepeat').matType('fail');
    cy.contains('button', 'Reset password').click();
    cy.get('mat-error').should('contain.text', 'Entered password are not equal');

  });

});
