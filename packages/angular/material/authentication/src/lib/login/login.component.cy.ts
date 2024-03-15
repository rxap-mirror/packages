import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RXAP_CONFIG } from '@rxap/config';
import { AuthenticationContainerComponent } from '../authentication-container/authentication-container.component';
import { LoginComponent } from './login.component';

describe(LoginComponent.name, () => {

  @Component({
    template: `
      <rxap-authentication-container>
        <rxap-login></rxap-login>
      </rxap-authentication-container>
    `,
    standalone: true,
    imports: [
      AuthenticationContainerComponent, LoginComponent,
    ],
  })
  class TestComponent {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule ],
      providers: [
        {
          provide: RXAP_CONFIG,
          useValue: {},
        },
      ],
    });
    cy.viewport(1280, 720);
  });

  it('renders', () => {
    cy.mount(TestComponent);
  });

  it('should use default credentials if provided', () => {
    cy.mount(TestComponent, {
      providers: [
        {
          provide: RXAP_CONFIG,
          useValue: {
            authentication: {
              default: {
                email: 'default@domain.de',
                password: 'default-password',
              },
            },
          },
        },
      ],
    });
    cy.get('input[formcontrolname="email"]').should('have.value', 'default@domain.de');
    cy.get('input[formcontrolname="password"]').should('have.value', 'default-password');
  });

  it('should only enable password forgotten button if email is provided', () => {
    cy.mount(TestComponent);
    cy.contains('button', 'Password forgotten').should('be.disabled');
    cy.get('input[formcontrolname="email"]').type('default@email.com');
    cy.contains('button', 'Password forgotten').should('not.be.disabled');
  });

  it('should show error message if email is invalid', () => {
    cy.mount(TestComponent);
    cy.contains('button', 'Password forgotten').should('be.disabled');
    cy.get('input[formcontrolname="email"]').type('invalid-email');
    cy.contains('button', 'Login').click();
    cy.get('.email-input mat-error').should('contain.text', 'Please enter a valid email address');
  });

  it('should show error message if email or password is empty', () => {
    cy.mount(TestComponent);
    cy.contains('button', 'Password forgotten').should('be.disabled');
    cy.contains('button', 'Login').click();
    cy.get('.email-input mat-error').should('contain.text', 'Email is required');
    cy.get('.password-input mat-error').should('contain.text', 'Password is required');
  });

  it('should show error message if login failed', () => {
    cy.mount(TestComponent);
    cy.contains('button', 'Password forgotten').should('be.disabled');
    cy.get('input[formcontrolname="email"]').type('default@email.com');
    cy.get('input[formcontrolname="password"]').type('fail');
    cy.contains('button', 'Login').click();
    cy.get('mat-error').should('contain.text', 'Method not implemented.');
  });

});
