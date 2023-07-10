import { TestBed } from '@angular/core/testing';
import { BooleanCellComponent } from './boolean-cell.component';

describe(BooleanCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(BooleanCellComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(BooleanCellComponent, {
      componentProperties: {
        value: null,
      },
    });
  });
});
