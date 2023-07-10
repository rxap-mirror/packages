import { TestBed } from '@angular/core/testing';
import { SidenavContentComponent } from './sidenav-content.component';

describe(SidenavContentComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(SidenavContentComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(SidenavContentComponent);
  });
});
