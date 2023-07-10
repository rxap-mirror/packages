import { TestBed } from '@angular/core/testing';
import { CheckboxHeaderCellComponent } from './checkbox-header-cell.component';

describe(CheckboxHeaderCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(CheckboxHeaderCellComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(CheckboxHeaderCellComponent);
  });
});
