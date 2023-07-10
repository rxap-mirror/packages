import { TestBed } from '@angular/core/testing';
import { NavigationItemComponent } from './navigation-item.component';

describe(NavigationItemComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(NavigationItemComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(NavigationItemComponent, {
      componentProperties: {
        level: 0,
      },
    });
  });
});
