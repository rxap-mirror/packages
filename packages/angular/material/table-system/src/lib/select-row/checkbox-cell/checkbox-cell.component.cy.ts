import { TestBed } from '@angular/core/testing';
import { CheckboxCellComponent } from './checkbox-cell.component';

describe(CheckboxCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(CheckboxCellComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(CheckboxCellComponent);
  });
});
