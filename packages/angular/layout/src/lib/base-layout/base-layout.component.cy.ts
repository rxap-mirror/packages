import { TestBed } from '@angular/core/testing';
import { BaseLayoutComponent } from './base-layout.component';

describe(BaseLayoutComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(BaseLayoutComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(BaseLayoutComponent);
  });
});
