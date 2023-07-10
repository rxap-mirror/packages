import { TestBed } from '@angular/core/testing';
import { SignOutComponent } from './sign-out.component';

describe(SignOutComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(SignOutComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(SignOutComponent);
  });
});
