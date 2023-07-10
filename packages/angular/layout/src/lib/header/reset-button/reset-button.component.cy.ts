import { TestBed } from '@angular/core/testing';
import { ResetButtonComponent } from './reset-button.component';

describe(ResetButtonComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ResetButtonComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ResetButtonComponent);
  });
});
