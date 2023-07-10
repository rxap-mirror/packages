import { TestBed } from '@angular/core/testing';
import { ErrorComponent } from './error.component';

describe(ErrorComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ErrorComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ErrorComponent);
  });
});
