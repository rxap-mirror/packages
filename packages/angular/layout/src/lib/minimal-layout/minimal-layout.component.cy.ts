import { TestBed } from '@angular/core/testing';
import { MinimalLayoutComponent } from './minimal-layout.component';

describe(MinimalLayoutComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(MinimalLayoutComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(MinimalLayoutComponent);
  });
});
