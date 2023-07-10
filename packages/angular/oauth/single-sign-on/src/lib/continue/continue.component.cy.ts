import { TestBed } from '@angular/core/testing';
import { ContinueComponent } from './continue.component';

describe(ContinueComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ContinueComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ContinueComponent);
  });
});
