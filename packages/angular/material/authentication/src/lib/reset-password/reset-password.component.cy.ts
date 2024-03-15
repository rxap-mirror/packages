import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationContainerComponent } from '../authentication-container/authentication-container.component';
import { ResetPasswordComponent } from './reset-password.component';

describe(ResetPasswordComponent.name, () => {

  @Component({
    template: `
      <rxap-authentication-container>
        <rxap-reset-password></rxap-reset-password>
      </rxap-authentication-container>
    `,
    standalone: true,
    imports: [
      AuthenticationContainerComponent, ResetPasswordComponent,
    ],
  })
  class TestComponent {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, RouterTestingModule ],
    });
    cy.viewport(1280, 720);
  });

  it('renders', () => {
    cy.mount(TestComponent);
  });

  it('should show error message if passwords are empty', () => {

    cy.mount(TestComponent);
    cy.contains('button', 'Reset password').click();
    cy.get('.password-input mat-error').should('contain.text', 'Password is required');

  });

  it('should show error message if passwords are not equal', () => {

    cy.mount(TestComponent);
    cy.matFormField('password').matType('password');
    cy.matFormField('passwordRepeat').matType('password2');
    cy.contains('button', 'Reset password').click();
    cy.get('mat-error').should('contain.text', 'Entered password are not equal');

  });

  it('should show error if password reset failed', () => {

    cy.mount(TestComponent);
    cy.matFormField('password').matType('fail');
    cy.matFormField('passwordRepeat').matType('fail');
    cy.contains('button', 'Reset password').click();
    cy.get('mat-error').should('contain.text', 'Method not implemented.');

  });

});
