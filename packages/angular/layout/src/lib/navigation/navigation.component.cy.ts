import { TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';

describe(NavigationComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(NavigationComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(NavigationComponent, {
      componentProperties: {
        root: '', level: 0,
      },
    });
  });
});
