import { TestBed } from '@angular/core/testing';
import { SignInWithRedirectComponent } from './sign-in-with-redirect.component';

describe(SignInWithRedirectComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(SignInWithRedirectComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(SignInWithRedirectComponent);
  });
});
