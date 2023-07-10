import { TestBed } from '@angular/core/testing';
import { DateCellComponent } from './date-cell.component';

describe(DateCellComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(DateCellComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(DateCellComponent, {
      componentProperties: {
        date: null,
        format: 'dd.MM.yyyy HH:mm',
      },
    });
  });
});
