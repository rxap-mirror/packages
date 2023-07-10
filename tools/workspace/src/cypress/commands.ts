/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Chainable<Subject> {

    /**
     * Get a <mat-form-field>  by the formControlName
     * @param formControlName
     */
    matFormField(formControlName: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the <mat-error> elements visible in the <mat-form-field>
     */
    matError(): Chainable<JQuery<HTMLElement>>;

    /**
     * Type into a <mat-form-field>
     *
     * 1. click on the label
     * 2. type the value into the input
     *
     * this is a workaround for the issue that the input is not visible -> this would result in an error
     *
     * @param value
     * @deprecated use matInput().type() instead
     */
    matType(value: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the <input> element of a <mat-form-field>
     */
    matInput(): Chainable<JQuery<HTMLElement>>;
  }
}

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => {
//   console.log('Custom command example: Login', email, password);
// });
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('matFormField', (formControlName: string) => {
  return cy.get(`mat-form-field input[formcontrolname="${ formControlName }"]`).parents('mat-form-field').first();
});

Cypress.Commands.add('matError', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).find('mat-error');
});

Cypress.Commands.add('matType', { prevSubject: true }, (subject, value: string) => {
  cy.wrap(subject).click();
  cy.wrap(subject).matInput().type(value);
  return undefined;
});

Cypress.Commands.add('matInput', { prevSubject: true }, (subject) => {
  // to prevent a compiler issue the $input type must be explicitly defined as JQuery<HTMLElement>
  return cy.wrap(subject).find('input').then(($input: JQuery<HTMLElement>) => {
    return cy.wrap($input);
  });
});
