import { TestBed } from '@angular/core/testing';
import { AuthenticationContainerComponent } from './authentication-container.component';

describe(AuthenticationContainerComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(AuthenticationContainerComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(AuthenticationContainerComponent);
  });
});
