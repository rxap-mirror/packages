import { TestBed } from '@angular/core/testing';
import { ErrorDialogComponent } from './error-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RxapError } from '@rxap/utilities';

describe(ErrorDialogComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ErrorDialogComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.viewport(1440, 900);
    cy.mount(ErrorDialogComponent, {
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { error: new RxapError('cypress', 'cy-message', 'cy-014', 'testing') },
        },
      ],
    });
    cy.get('table tbody tr').should('have.length', 6);
    cy.get('[data-name="package"] > .value > div').should('have.text', 'cypress');
    cy.get('[data-name="class"] > .value > div').should('have.text', '');
    cy.get('[data-name="code"] > .value > div').should('have.text', 'cy-014');
    cy.get('[data-name="scope"] > .value > div').should('have.text', 'testing');
    cy.get('[data-name="stack"] > .value > div').should('contain.text', 'RxapError: cy-message');
    cy.get('[data-name="message"] > .value > div').should('have.text', 'cy-message');
  });
});
