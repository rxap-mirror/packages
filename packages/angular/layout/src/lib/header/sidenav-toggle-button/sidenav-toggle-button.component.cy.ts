import { TestBed } from '@angular/core/testing';
import { SidenavToggleButtonComponent } from './sidenav-toggle-button.component';

describe(SidenavToggleButtonComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(SidenavToggleButtonComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(SidenavToggleButtonComponent);
  });
});
