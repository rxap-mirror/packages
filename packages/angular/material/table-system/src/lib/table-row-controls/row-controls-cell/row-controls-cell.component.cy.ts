import { TestBed } from '@angular/core/testing';
import { RowControlsCellComponent } from './row-controls-cell.component';

describe(RowControlsCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(RowControlsCellComponent, {
      add: {
        imports: [], providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(RowControlsCellComponent);
  });
});
