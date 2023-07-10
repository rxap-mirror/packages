import { TestBed } from '@angular/core/testing';
import { WindowContainerComponent } from './window-container.component';

describe(WindowContainerComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(WindowContainerComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(WindowContainerComponent);
  });
});
