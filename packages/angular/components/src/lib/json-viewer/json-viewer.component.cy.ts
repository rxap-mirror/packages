import { TestBed } from '@angular/core/testing';
import { JsonViewerComponent } from './json-viewer.component';

describe(JsonViewerComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(JsonViewerComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(JsonViewerComponent);
  });

  it('display json', () => {
    cy.mount(JsonViewerComponent, {
      componentProperties: {
        json: {
          'employee': {
            'firstName': 'John',
            'lastName': 'Doe',
            'age': 30,
            'email': 'john.doe@example.com',
            'address': {
              'street': '1234 Park St',
              'city': 'San Francisco',
              'state': 'CA',
              'postalCode': '94104',
            },
            'roles': [ 'Developer', 'Team Lead' ],
            projects: [
              {
                name: 'project 1',
              },
            ],
          },
        },
        expanded: true,
      },
    });
    cy.get('section.segment-main.expandable')
      .contains('employee:')
      .parent('section.segment.segment-type-object')
      .within(() => {
        cy.get('section.segment-main.expandable')
          .contains('address:')
          .parent('section.segment.segment-type-object')
          .within(() => {
            cy.get('section.segment-main').contains('city: "San Francisco"');
            cy.get('section.segment-main').contains('street: "1234 Park St"');
            cy.get('section.segment-main').contains('state: "CA"');
            cy.get('section.segment-main').contains('postalCode: "94104"');
          });
        cy.get('section.segment-main').contains('firstName: "John"');
        cy.get('section.segment-main').contains('lastName: "Doe"');
        cy.get('section.segment-main').contains('age: 30');
        cy.get('section.segment-main').contains('email: "john.doe@example.com"');
        cy.get('section.segment-main.expandable')
          .contains('projects:')
          .parent('section.segment.segment-type-array')
          .within(() => {
            cy.get('section.segment-main.expandable')
              .contains('0:')
              .parent('section.segment.segment-type-object')
              .within(() => {
                cy.get('section.segment-main').contains('name: "project 1"');
              });
          });
        cy.get('section.segment-main.expandable')
          .contains('roles:')
          .parent('section.segment.segment-type-array')
          .within(() => {
            cy.get('section.segment-main').contains('0: "Developer"');
            cy.get('section.segment-main').contains('1: "Team Lead"');
          });
      });
  });
});
