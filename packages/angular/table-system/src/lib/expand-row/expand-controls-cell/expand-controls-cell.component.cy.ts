import { TestBed } from '@angular/core/testing';
import { ExpandControlsCellComponent } from './expand-controls-cell.component';

describe(ExpandControlsCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ExpandControlsCellComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ExpandControlsCellComponent);
  });
});
