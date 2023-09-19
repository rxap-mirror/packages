import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthorizationDevelopmentControlsComponent } from './authorization-development-controls.component';

describe(AuthorizationDevelopmentControlsComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(AuthorizationDevelopmentControlsComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(AuthorizationDevelopmentControlsComponent, {
      imports: [
        NoopAnimationsModule,
      ],
    });
  });

  it('should open permission list overlay', () => {
    cy.mount(AuthorizationDevelopmentControlsComponent, {
      imports: [
        NoopAnimationsModule,
      ],
    });
    cy.get('button').click();
    cy.get('.cdk-overlay-pane').should('exist');
    cy.get('.cdk-overlay-pane').should('contain.text', 'permission1');
    cy.get('.cdk-overlay-pane').should('contain.text', 'permission2');
  });

});
