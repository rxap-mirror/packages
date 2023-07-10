import { TestBed } from '@angular/core/testing';
import { ContainerComponent } from './container.component';

describe(ContainerComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ContainerComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ContainerComponent);
  });
});
