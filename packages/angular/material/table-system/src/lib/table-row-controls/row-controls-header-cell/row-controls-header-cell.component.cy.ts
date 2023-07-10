import { TestBed } from '@angular/core/testing';
import { RowControlsHeaderCellComponent } from './row-controls-header-cell.component';

describe(RowControlsHeaderCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(RowControlsHeaderCellComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(RowControlsHeaderCellComponent);
  });
});
