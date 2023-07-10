import { TestBed } from '@angular/core/testing';
import { ToggleWindowSidenavButtonComponent } from './toggle-window-sidenav-button.component';

describe(ToggleWindowSidenavButtonComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ToggleWindowSidenavButtonComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ToggleWindowSidenavButtonComponent, {
      componentProperties: {
        openWindowSidenav: false,
      },
    });
  });
});
