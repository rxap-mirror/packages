import { TestBed } from '@angular/core/testing';
import { ExpandRowContainerComponent } from './expand-row-container.component';

describe(ExpandRowContainerComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ExpandRowContainerComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ExpandRowContainerComponent);
  });
});
