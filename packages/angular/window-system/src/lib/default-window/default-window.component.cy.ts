import { TestBed } from '@angular/core/testing';
import { DefaultWindowComponent } from './default-window.component';

describe(DefaultWindowComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(DefaultWindowComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(DefaultWindowComponent);
  });
});
