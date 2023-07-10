import { TestBed } from '@angular/core/testing';
import { LayoutComponent } from './layout.component';

describe(LayoutComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(LayoutComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(LayoutComponent);
  });
});
