import { TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe(ConfirmDialogComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ConfirmDialogComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ConfirmDialogComponent, {
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            message: 'cypress test message',
            action: 'cypress test action',
          },
        },
      ],
    });
    cy.get('button').should('contain.text', 'cypress test action');
    cy.get('.content').should('contain.text', 'cypress test message');
  });
});
