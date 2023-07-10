import { TestBed } from '@angular/core/testing';
import { WindowContainerSidenavComponent } from './window-container-sidenav.component';

describe(WindowContainerSidenavComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(WindowContainerSidenavComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(WindowContainerSidenavComponent);
  });
});
