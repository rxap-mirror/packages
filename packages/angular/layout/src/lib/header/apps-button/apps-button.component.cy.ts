import { TestBed } from '@angular/core/testing';
import { AppsButtonComponent } from './apps-button.component';

describe(AppsButtonComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(AppsButtonComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(AppsButtonComponent);
  });
});
