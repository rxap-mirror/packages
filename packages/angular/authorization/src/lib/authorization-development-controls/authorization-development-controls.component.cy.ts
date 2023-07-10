import { TestBed } from '@angular/core/testing';
import { AuthorizationDevelopmentControlsComponent } from './authorization-development-controls.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthorizationModule } from '../authorization.module';

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
        AuthorizationModule.forRoot({
          development: true,
          roles: {
            admin: [ 'permission1', 'permission2' ],
            user: [ 'permission1' ],
            guest: [],
          },
        }),
      ],
    });
  });

  it('should open permission list overlay', () => {
    cy.mount(AuthorizationDevelopmentControlsComponent, {
      imports: [
        NoopAnimationsModule,
        AuthorizationModule.forRoot({
          development: true,
          roles: {
            admin: [ 'permission1', 'permission2' ],
            user: [ 'permission1' ],
            guest: [],
          },
        }),
      ],
    });
    cy.get('button').click();
    cy.get('.cdk-overlay-pane').should('exist');
    cy.get('.cdk-overlay-pane').should('contain.text', 'permission1');
    cy.get('.cdk-overlay-pane').should('contain.text', 'permission2');
  });

});
