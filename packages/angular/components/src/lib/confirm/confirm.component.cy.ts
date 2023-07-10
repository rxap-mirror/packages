import { TestBed } from '@angular/core/testing';
import { ConfirmComponent } from './confirm.component';
import { Component } from '@angular/core';
import { ConfirmDirective } from './confirm.directive';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

describe(ConfirmComponent.name, () => {

  @Component({
    standalone: true, template: `
          <button (confirmed)="confirm = true" (unconfirmed)="decline = true" mat-raised-button rxapConfirm>Confirm
              Button
          </button>
          <span *ngIf="confirm">confirm</span>
          <span *ngIf="decline">decline</span>
    `, imports: [ NgIf, ConfirmDirective, ConfirmComponent, MatButtonModule ],
  })
  class TestComponent {

    confirm = false;
    decline = false;

  }

  beforeEach(() => {
    TestBed.overrideComponent(TestComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(TestComponent);
    cy.get('button').should('exist');
    cy.get('button').click();
    cy.get('button.accept').should('exist');
    cy.get('button.decline').should('exist');
  });

  it('confirm', () => {
    cy.mount(TestComponent);
    cy.get('button').click();
    cy.get('button.accept').click();
    cy.get('span').contains('confirm').should('exist');
  });

  it('decline', () => {
    cy.mount(TestComponent);
    cy.get('button').click();
    cy.get('button.decline').click();
    cy.get('span').contains('decline').should('exist');
  });

});
