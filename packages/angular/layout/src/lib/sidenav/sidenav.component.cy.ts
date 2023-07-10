import { TestBed } from '@angular/core/testing';
import { SidenavComponent } from './sidenav.component';

describe(SidenavComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(SidenavComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(SidenavComponent);
  });
});
