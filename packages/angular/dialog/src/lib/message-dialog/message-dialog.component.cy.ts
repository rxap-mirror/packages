import { TestBed } from '@angular/core/testing';
import { MessageDialogComponent } from './message-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe(MessageDialogComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(MessageDialogComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(MessageDialogComponent, {
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Cypress Test',
            message: 'This is a cypress test message',
            actions: [
              {
                label: 'Ok',
                type: 'ok',
              },
              {
                label: 'Cancel',
                type: 'cancel',
              },
            ],
          },
        },
      ],
    });
    cy.contains('button', 'Ok').should('exist');
    cy.contains('button', 'Cancel').should('exist');
    cy.get('.content').should('have.text', 'This is a cypress test message');
    cy.get('h2').should('have.text', 'Cypress Test');
  });
});
