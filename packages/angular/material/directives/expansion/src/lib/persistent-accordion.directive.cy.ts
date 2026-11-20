
import {
  ChangeDetectionStrategy,
  Component,
  input,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PersistentAccordionDirective } from './persistent-accordion.directive';

describe(PersistentAccordionDirective.name, () => {

  @Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <mat-accordion rxapPersistentAccordion="testing" multi>
        
        @if (a()) {
<mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              Personal data A
            </mat-panel-title>
            <mat-panel-description>
              Type your name and age
            </mat-panel-description>
          </mat-expansion-panel-header>
          <p>Some content A</p>
        </mat-expansion-panel>
}
        
        @if (b()) {
<mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              Personal data B
            </mat-panel-title>
            <mat-panel-description>
              Type your name and age
            </mat-panel-description>
          </mat-expansion-panel-header>
          <p>Some content B</p>
        </mat-expansion-panel>
}
        
        @if (c()) {
<mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              Personal data C
            </mat-panel-title>
            <mat-panel-description>
              Type your name and age
            </mat-panel-description>
          </mat-expansion-panel-header>
          <p>Some content C</p>
        </mat-expansion-panel>
}
        
      </mat-accordion>

    `,
    imports: [
    MatExpansionModule,
    PersistentAccordionDirective
],
  })
  class TestComponent  {

    readonly a = input(true);
    readonly b = input(false);
    readonly c = input(true);
    readonly directive = viewChild.required(PersistentAccordionDirective);

  }

  function hashString(s: string): string {
    let hash = 0, i, char;
    if (s.length === 0) return hash.toFixed(0);
    for (i = 0; i < s.length; i++) {
      char = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toFixed(0);
  }

  function buildKey(title: string) {
    return ['rxapPersistentAccordion', 'testing', hashString(title)].join('_');
  }

  function setExpandedState(title: string, expanded: boolean) {
    window.localStorage.setItem(buildKey(title), expanded ? 'true' : 'false');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestComponent,
        NoopAnimationsModule,
      ],
    });
  });

  it('should create an instance', () => {
    cy.mount(TestComponent).then(response => {
      const directive = response.component.directive();
      expect(directive instanceof PersistentAccordionDirective).to.be.true;
    });
  });

  it('should restore the state', () => {
    setExpandedState('Personal data A', true);
    cy.mount(TestComponent);
    cy.contains('.mat-expansion-panel-content', 'Some content A').should('be.visible');
  });

  it('should restore the state after the initial component creation', () => {
    setExpandedState('Personal data A', true);
    setExpandedState('Personal data B', true);
    cy.mount(TestComponent).then(response => {
      cy.contains('.mat-expansion-panel-content', 'Some content A').should('be.visible').then(() => {
        response.fixture.componentRef.setInput('b', true);
        response.fixture.detectChanges();
        cy.contains('.mat-expansion-panel-content', 'Some content A').should('be.visible');
        cy.contains('.mat-expansion-panel-content', 'Some content B').should('be.visible');
      });
    });
  });

});
